using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;

namespace Common.WebSockets
{

#warning Somehow test ping/pong - Perhaps Opera?

    internal class WebSocketClient : Client
    {

        internal EndPoint RemoteEndPoint { get; private set; }

        public const int BufferSize = 1024 * 8;

        private byte[] smallBuffer = new byte[BufferSize];

        private List<byte> largeBuffer = new List<byte>();

        private List<byte> incompletePayload = new List<byte>();

        internal delegate void PacketReceivedDelegate(Packet packet);

        internal event PacketReceivedDelegate PacketReceived;

        private bool started;

        internal WebSocketClient(Socket socket) : base(socket)
        {
            RemoteEndPoint = socket.RemoteEndPoint;
        }

        internal void Start()
        {

            // Change started flag
            if (started)
            {
                throw new Exception("The web socket client has already been started.");
            }
            started = true;

            // Get data from the socket
            Socket.BeginReceive(smallBuffer, 0, BufferSize, 0, GatherPendingData, null);
        }

        internal void GatherPendingData(IAsyncResult result)
        {
            try
            {

                // Keep reading data into the small buffer and then moving it into the big buffer
                var bytesReceived = 0;
                if (Socket != null)
                {
                    bytesReceived = Socket.EndReceive(result);
                    if (bytesReceived > 0)
                    {
                        for (var i = 0; i < bytesReceived; i++)
                        {
                            largeBuffer.Add(smallBuffer[i]);
                        }
                    }
                }

                // Handle the case where there is no data, a special case for connected sockets that are disconnecting
                if (bytesReceived == 0)
                {
                    return;
                }

                // Do we have a complete packet available?
                if (largeBuffer.Count > 0)
                {
                    var packet = (Packet)null;
                    do
                    {
                        packet = DecodeBuffer();
                        if (packet != null)
                        {
                            PacketReceived?.Invoke(packet);
                        }
                    }
                    while (packet != null);
                }

                // Ask for additional data if the last packet wasn't a disconnection that set Socket to null
                if (Socket != null)
                {
                    Socket.BeginReceive(smallBuffer, 0, BufferSize, 0, GatherPendingData, null);
                }
            }
            catch (ObjectDisposedException)
            {

                // "Standard practise", Microsoft says, for when the application is closing and the socket is closed
                return;
            }
            catch (Exception ex)
            {

                // When errors occur, we must disconnect the client for stability reasons
                Disconnect(4000, ex.Message);
                var disconnectionPacket = new Packet(RemoteEndPoint, WebSocketAction.Disconnect, ex.Message);
                PacketReceived?.Invoke(disconnectionPacket);
            }
        }

        internal void Send(WebSocketOpCode opCode, string payloadText)
        {
            Send(opCode, Encoding.UTF8.GetBytes(payloadText), false);
        }

        internal void Send(WebSocketOpCode opCode, byte[] payloadBytes, bool disconnectionInProgress)
        {
            try
            {

                // Start creating a WebSocket packet
                const int DefaultCapacity = 64;
                var result = new List<byte>(DefaultCapacity);
                result.Add((byte)(128 | (byte)opCode));

                // Add the payload bytes to the WebSocket packet, prefixed with a properly encoded length
                if (payloadBytes.Length <= 125)
                {
                    result.Add((byte)payloadBytes.Length);
                }
                if (payloadBytes.Length > 125 && payloadBytes.Length <= ushort.MaxValue)
                {
                    result.Add(126);
                    var interim = BitConverter.GetBytes((ushort)payloadBytes.Length);
                    Array.Reverse(interim);
                    result.AddRange(interim);
                }
                if (payloadBytes.Length > ushort.MaxValue)
                {
                    result.Add(127);
                    var interim = BitConverter.GetBytes((ulong)payloadBytes.Length);
                    Array.Reverse(interim);
                    result.AddRange(interim);
                }
                result.AddRange(payloadBytes);

                // Send the data
                Socket.Send(result.ToArray());
            }
            catch (Exception ex)
            {

                // Make one attempt to nicely disconnect the socket and raise a disconnection packet
                if (!disconnectionInProgress) {
                    Disconnect(4000, ex.Message);
                    var disconnectionPacket = new Packet(RemoteEndPoint, WebSocketAction.Disconnect, ex.Message);
                    PacketReceived?.Invoke(disconnectionPacket);
                }
            }
        }

        internal void TrySendClose(int code, string reason)
        {
            if (Socket != null)
            {
                try
                {
                    var payload = new byte[] { (byte)code, (byte)(code >> 8) }.Reverse().Concat(Encoding.UTF8.GetBytes(reason)).ToArray();
                    Send(WebSocketOpCode.Close, payload, true);
                }
                catch { }
            }
        }

        internal void Disconnect(short code, string reason)
        {

            // Try to be nice by sending a disconnection packet
            TrySendClose(code, reason);

            // Common disconnection handling
            DisconnectSocket();
        }

        private Packet DecodeBuffer()
        {
            var position = 0;
            var header = PayloadHeader.Decode(largeBuffer, position);
            if (header == null) return null;
            position += header.Size;

            // Confirm that we have retrieved enough bytes, otherwise we need to wait for more data to come in
            var totalExpectedSize = header.Size + header.PayloadLength;
            if (largeBuffer.Count < totalExpectedSize)
            {
                return null;
            }

            // Copy the payload into its own array, unmasking it if necessary into a readable form
            var payloadBytes = new byte[header.PayloadLength];
            if (header.Masked)
            {
                for (var i = 0; i < header.PayloadLength; i++)
                {
                    payloadBytes[i] = (byte)(largeBuffer[position + i] ^ header.MaskKey[i % 4]);
                }
            }
            else
            {
                largeBuffer.CopyTo(position, payloadBytes, 0, header.PayloadLength);
            }

            // Advance the position
            position += header.PayloadLength;

            // We only accept these types of opcode
            switch (header.OpCode)
            {
                case WebSocketOpCode.Close:
                    largeBuffer.RemoveRange(0, position);
                    return new Packet(RemoteEndPoint, WebSocketAction.Disconnect, "Intentional client disconnection.");

                case WebSocketOpCode.Text:
                case WebSocketOpCode.Continuation:
                case WebSocketOpCode.Ping:

                    // Add to the payload
                    largeBuffer.RemoveRange(0, position);
                    incompletePayload.AddRange(payloadBytes);

                    // Do we have a complete payload?
                    if (!header.FinishedBit) return DecodeBuffer();

                    // Convert the completed payload into a string
                    var payloadText = Encoding.UTF8.GetString(incompletePayload.ToArray());
                    incompletePayload.Clear();

                    // Raise a text packet for processing
                    if (header.OpCode != WebSocketOpCode.Ping)
                    {
                        return new Packet(RemoteEndPoint, WebSocketAction.SendText, payloadText);
                    }

                    // Send a pong and get the next packet
                    Send(WebSocketOpCode.Pong, payloadText);
                    return DecodeBuffer();

                case WebSocketOpCode.Pong:

                    // Simply get the next packet
                    largeBuffer.RemoveRange(0, position);
                    return DecodeBuffer();

                default:
                    throw new NotImplementedException("Web socket opcode " + header.OpCode + " is currently not supported.");
            }
        }

    }

}
