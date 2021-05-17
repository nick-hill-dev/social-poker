using Common.WebSockets.Properties;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;

namespace Common.WebSockets
{

    /// <summary>
    /// Contains all of the functionality required to support serving websocket-based clients.
    /// </summary>
    public class WebSocketServer
    {

        private TcpListener listener;

        private List<HttpClient> httpClients = new List<HttpClient>();

        private List<WebSocketClient> webSocketClients = new List<WebSocketClient>();

        private Queue<Packet> queuedPackets = new Queue<Packet>();

        public delegate void ClientConnectedDelegate(EndPoint endPoint, Dictionary<string, string> cookies);

        public event ClientConnectedDelegate ClientConnected;

        public delegate void ClientSendTextDelegate(EndPoint endPoint, string text);

        public event ClientSendTextDelegate ClientSendText;

        public delegate void ClientDisconnectedDelegate(EndPoint endPoint, string reason);

        public event ClientDisconnectedDelegate ClientDisconnected;

        public delegate void DiagnosticDelegate(Exception exception);

        public event DiagnosticDelegate LogDiagnostic;

        private bool started;

        private object syncObject = new object();

        /// <summary>
        /// Initializes a new instance of the <see cref="WebSocketServer"/> class.
        /// The websocket server is started immediately.
        /// </summary>
        /// <param name="port">The port number to listen for requests on.</param>
        public WebSocketServer(int port)
        {
            listener = new TcpListener(IPAddress.Any, port);
        }

        public void Start()
        {

            // Change started flag
            if (started)
            {
                throw new Exception("The web socket server has already been started.");
            }
            started = true;

            // Start the listener
            listener.Start();
            listener.BeginAcceptTcpClient(AcceptHttpClient, listener);
        }

        /// <summary>
        /// Gets the list of websockets remote end points that are currently connected.
        /// </summary>
        /// <returns>The list of connected web socket end points.</returns>
        public IEnumerable<EndPoint> GetClients()
        {
            var result = (EndPoint[])null;
            lock (syncObject)
            {
                result = webSocketClients.Select(s => s.RemoteEndPoint).ToArray();
            }
            return result;
        }

#warning In Supernova, try sending lots and lots of data at one time and confirm only one person is disconnected. Subsequently fix whatever code here that causes the exception.

        /// <summary>
        /// Disconnects the web socket associated with the specified remote end point, providing the specified reason as the reason for the disconnection.
        /// It is the responsibility of the caller to believe that the web socket is immediately and successfully closed.
        /// There will not be a further notification of the closure of the web socket, ie via a disconnection packet.
        /// Invalid remote end points are ignored.
        /// </summary>
        /// <param name="remoteEndPoint">The remote end point associated with the web socket, that will be closed.</param>
        public void Disconnect(EndPoint remoteEndPoint)
        {
            Disconnect(remoteEndPoint, null);
        }

        /// <summary>
        /// Disconnects the web socket associated with the specified remote end point.
        /// It is the responsibility of the caller to believe that the web socket is immediately and successfully closed.
        /// There will not be a further notification of the closure of the web socket, ie via a disconnection packet.
        /// Invalid remote end points are ignored.
        /// </summary>
        /// <param name="remoteEndPoint">The remote end point associated with the web socket, that will be closed.</param>
        public void Disconnect(EndPoint remoteEndPoint, string reason)
        {
            var client = webSocketClients.FirstOrDefault(c => c.RemoteEndPoint.Equals(remoteEndPoint));
            if (client != null)
            {

                // Disconnect the socket
                client.Disconnect(4000, reason);

                // Remove from the list
                webSocketClients.Remove(client);
            }
        }

        /// <summary>
        /// Stops the web socket server, ignoring any exceptions that occur.
        /// </summary>
        public void Stop()
        {

            // Stop the listener
            try { listener.Stop(); }
            catch { }

            // Remove all queued packets
            queuedPackets.Clear();

            // Disconnect all HTTP clients
            foreach (var client in httpClients)
            {
                try { client.DisconnectSocket(); }
                catch { }
            }

            // Disconnect all web socket clients
            foreach (var client in webSocketClients)
            {
                try { client.Disconnect(4000, "The server is shutting down."); }
                catch { }
            }
        }

        /// <summary>
        /// Sends the specified line of text to the specified websocket.
        /// </summary>
        /// <param name="remoteEndPoint">The connected endpoint to send the data to, using the websocket protocol.</param>
        /// <param name="text">The line of text to send through the socket.</param>
        public void Send(EndPoint remoteEndPoint, string text)
        {
            var client = webSocketClients.FirstOrDefault(c => c.RemoteEndPoint.Equals(remoteEndPoint));
            if (client == null)
            {
                throw new Exception(remoteEndPoint + " is not connected to the websocket server.");
            }
            client.Send(WebSocketOpCode.Text, text);
        }

        /// <summary>
        /// Sends the specified collection of strings to the specified websocket.
        /// The string is composed of all of the specified parts, with spaces separating them.
        /// If a part contains a space, then the part will be enclosed in quotes.
        /// Quote characters in parts containing spaces are escaped with a backslash character (\).
        /// </summary>
        /// <param name="remoteEndPoint">The connected endpoint to send the data to, using the websocket protocol.</param>
        /// <param name="parts">The strings to send through the socket.</param>
        public void Send(EndPoint remoteEndPoint, params string[] parts)
        {
            var text = StringTools.FromStringArray(parts);
            Send(remoteEndPoint, text);
        }

        /// <summary>
        /// Sends the specified line of text to all of the currently connected websockets.
        /// </summary>
        /// <param name="text">The line of text to send through the sockets.</param>
        public void SendAll(string text)
        {
            foreach (var client in webSocketClients.ToArray())
            {
                Send(client.RemoteEndPoint, text);
            }
        }

        /// <summary>
        /// Sends the specified collection of strings to all of the currently connected websockets.
        /// The string is composed of all of the specified parts, with spaces separating them.
        /// If a part contains a space, then the part will be enclosed in quotes.
        /// Quote characters in parts containing spaces are escaped with a backslash character (\).
        /// </summary>
        /// <param name="parts">The strings to send through the sockets.</param>
        public void SendAll(params string[] parts)
        {
            var text = StringTools.FromStringArray(parts);
            foreach (var client in webSocketClients.ToArray())
            {
                Send(client.RemoteEndPoint, text);
            }
        }

        /// <summary>
        /// Sends the specified line of text to all of the currently connected websockets, except for the specified websocket.
        /// </summary>
        /// <param name="remoteEndPoint">The endpoint to except when sending data to the other connected endpoints.</param>
        /// <param name="text">The line of text to send through the sockets.</param>
        public void SendExcept(EndPoint remoteEndPoint, string text)
        {
            foreach (var client in webSocketClients.ToArray())
            {
                if (client.RemoteEndPoint != remoteEndPoint)
                {
                    Send(client.RemoteEndPoint, text);
                }
            }
        }

        /// <summary>
        /// Sends the specified line of text to all of the currently connected websockets, except for the specified websocket.
        /// The string is composed of all of the specified parts, with spaces separating them.
        /// If a part contains a space, then the part will be enclosed in quotes.
        /// Quote characters in parts containing spaces are escaped with a backslash character (\).
        /// </summary>
        /// <param name="remoteEndPoint">The endpoint to except when sending data to the other connected endpoints.</param>
        /// <param name="parts">The strings to send through the sockets.</param>
        public void SendExcept(EndPoint remoteEndPoint, params string[] parts)
        {
            var text = StringTools.FromStringArray(parts);
            foreach (var client in webSocketClients.ToArray())
            {
                if (client.RemoteEndPoint != remoteEndPoint)
                {
                    Send(client.RemoteEndPoint, text);
                }
            }
        }

        private void AcceptHttpClient(IAsyncResult result)
        {
            try
            {

                // Accept a new TCP client
                var listener = (TcpListener)result.AsyncState;
                var acceptedClient = listener.EndAcceptTcpClient(result);
                acceptedClient.LingerState = new LingerOption(Settings.Default.SocketLingerStateEnabled, Settings.Default.SocketLingerStateTimeSeconds);
                acceptedClient.NoDelay = Settings.Default.SocketNoDelay;
                acceptedClient.ReceiveTimeout = Settings.Default.SocketReceiveTimeoutMilliseconds;
                acceptedClient.SendTimeout = Settings.Default.SocketSendTimeoutMilliseconds;

                // Assume they are a HTTP client
                var httpClient = new HttpClient(acceptedClient.Client);
                httpClients.Add(httpClient);
                httpClient.HttpUpgradeCompleted += HttpUpgradeCompleted;
                httpClient.HttpUpgradeFailed += HttpUpgradeFailed;
                httpClient.Start();

                // Accept additional connections
                listener.BeginAcceptTcpClient(AcceptHttpClient, listener);
            }
            catch (ObjectDisposedException)
            {

                // "Standard practise", Microsoft says, for when the application is closing and the socket is closed
            }
            catch (Exception ex)
            {
                LogDiagnostic?.Invoke(ex);
            }
        }

        private void HttpUpgradeCompleted(HttpClient sender)
        {
            lock (syncObject)
            {

                // Move the HTTP client to the web socket client list
                httpClients.Remove(sender);
                var webSocketClient = new WebSocketClient(sender.Socket);
                webSocketClients.Add(webSocketClient);

                // Raise a connection packet
                var connectionPacket = new ConnectionPacket(sender.Socket.RemoteEndPoint, sender.Cookies);
                ClientConnected?.Invoke(sender.Socket.RemoteEndPoint, sender.Cookies);

                // Start operating the web socket client
                webSocketClient.PacketReceived += WebSocketPacketReceived;
                webSocketClient.Start();
            }
        }

        private void HttpUpgradeFailed(HttpClient sender)
        {
            lock (syncObject)
            {
                httpClients.Remove(sender);
            }
        }

        private void WebSocketPacketReceived(Packet packet)
        {
            lock (syncObject)
            {
                switch (packet.Action)
                {
                    case WebSocketAction.Connect:
                        ClientConnected?.Invoke(packet.RemoteEndPoint, ((ConnectionPacket)packet).Cookies);
                        break;

                    case WebSocketAction.SendText:
                        ClientSendText?.Invoke(packet.RemoteEndPoint, packet.Text);
                        break;

                    case WebSocketAction.Disconnect:
                        var client = webSocketClients.FirstOrDefault(c => c.RemoteEndPoint.Equals(packet.RemoteEndPoint));
                        if (client != null)
                        {
                            client.Disconnect(4000, "Responding to client's request to close the connection.");
                            webSocketClients.Remove(client);
                            ClientDisconnected?.Invoke(packet.RemoteEndPoint, packet.Text);
                        }
                        break;

                    default:
                        throw new NotImplementedException();
                }
            }
        }

    }

}
