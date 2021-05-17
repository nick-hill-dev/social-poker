namespace Common.WebSockets
{

    /// <summary>
    /// Specifies an action that a connected websocket client has performed.
    /// </summary>
    public enum WebSocketAction
    {

        /// <summary>
        /// The websocket client has connected to the websocket server.
        /// </summary>
        Connect,

        /// <summary>
        /// The websocket client has sent a line of text to the websocket server.
        /// </summary>
        SendText,

        /// <summary>
        /// The websocket client has disconnected from the websocket server.
        /// </summary>
        Disconnect

    }

}
