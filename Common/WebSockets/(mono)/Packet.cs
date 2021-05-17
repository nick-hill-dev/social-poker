using System.Net;

namespace Common.WebSockets
{

    /// <summary>
    /// Represents a packet of data being sent by a client connected via a websocket channel.
    /// </summary>
    public class Packet
    {

        /// <summary>
        /// Gets the address of the destination computer, the object that should be used to send a response.
        /// </summary>
        public EndPoint RemoteEndPoint { get; private set; }

        /// <summary>
        /// Gets the type of action that was performed by the client.
        /// </summary>
        public WebSocketAction Action { get; private set; }

        /// <summary>
        /// Gets the text specified by the web socket client whenever the <see cref="WebSocketAction"/> is SendText.
        /// </summary>
        public string Text { get; private set; }

        internal Packet(EndPoint remoteEndPoint, WebSocketAction action, string text)
        {
            RemoteEndPoint = remoteEndPoint;
            Action = action;
            Text = text;
        }

        internal static Packet CreateDisconnectionPacket(EndPoint remoteEndPoint, string reason)
        {
            return new Packet(remoteEndPoint, WebSocketAction.Disconnect, reason);
        }

    }

}
