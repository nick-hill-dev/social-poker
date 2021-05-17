using System.Collections.Generic;
using System.Net;

namespace Common.WebSockets
{

    /// <summary>
    /// Represents a connection packet that inherits all of functionality of being a packet, but also defines additional
    /// information about the user connecting to the websocket server. Most of the additional information comes from the HTTP
    /// headers that the client specified in their HTTP-based websocket upgrade request.
    /// </summary>
    public class ConnectionPacket : Packet
    {

        /// <summary>
        /// Gets the cookies that the user specified in their HTTP-based websocket upgrade request.
        /// </summary>
        public Dictionary<string, string> Cookies { get; private set; }

        internal ConnectionPacket(EndPoint remoteEndPoint, Dictionary<string, string> cookies)
            : base(remoteEndPoint, WebSocketAction.Connect, string.Empty)
        {
            Cookies = cookies;
        }

    }

}
