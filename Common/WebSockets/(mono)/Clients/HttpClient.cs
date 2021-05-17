using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;

namespace Common.WebSockets
{

    internal class HttpClient : Client
    {

        private const string HttpNewLine = "\r\n";

        private static SHA1CryptoServiceProvider shaAlgorithm = new SHA1CryptoServiceProvider();

        private const string ProtocolKey = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

        internal int WebsocketVersion { get; private set; }

        internal Dictionary<string, string> Cookies { get; private set; }

        internal delegate void HttpUpgradeCompletedDelegate(HttpClient sender);

        internal event HttpUpgradeCompletedDelegate HttpUpgradeCompleted;

        internal delegate void HttpUpgradeFailedDelegate(HttpClient sender);

        internal event HttpUpgradeFailedDelegate HttpUpgradeFailed;

        private bool started;

        internal HttpClient(Socket socket) : base(socket)
        {
        }

        internal void Start()
        {

            // Change started flag
            if (started)
            {
                throw new Exception("The HTTP client has already been started.");
            }
            started = true;

            // Catch completed upgrade request, which is a prerequisite to entering web socket mode
            var request = new HttpClientRequest(Socket);
            request.BeginReceive(CheckForCompletedUpgradeRequest);
        }

        internal void CheckForCompletedUpgradeRequest(IAsyncResult result)
        {
            try
            {

                // Add to the upgrade request if more data is available
                var request = (HttpClientRequest)result.AsyncState;
                var bytesReceived = 0;

                bytesReceived = Socket.EndReceive(result);
                if (bytesReceived > 0)
                {
                    var incomingText = Encoding.UTF8.GetString(request.Buffer, 0, bytesReceived);
                    request.RequestText.Append(incomingText);
                }

                // Handle the case where there is no data, a special case for connected sockets that are disconnecting
                if (bytesReceived == 0)
                {
                    HttpUpgradeFailed?.Invoke(this);
                    return;
                }

                // Have we received a complete HTTP request?
                var text = request.RequestText.ToString();
                if (!text.EndsWith(HttpNewLine + HttpNewLine))
                {

                    // Ask for more data
                    request.BeginReceive(CheckForCompletedUpgradeRequest);
                    return;
                }

                // Split the entire request into lines
                var version = 0;
                var key = string.Empty;
                var subProtocol = "chat";
                var upgradeRequested = false;
                var cookies = new Dictionary<string, string>();
                foreach (var line in text.Split(new string[] { HttpNewLine }, StringSplitOptions.RemoveEmptyEntries))
                {

                    // Split each line into parts
                    var index = line.IndexOf(':');
                    if (index != -1)
                    {
                        var headerName = line.Substring(0, index).ToLower();
                        var value = line.Substring(index + 1).Trim();
                        if (headerName == "sec-websocket-version") int.TryParse(value, out version);
                        if (headerName == "sec-websocket-key") key = value;
                        if (headerName == "sec-websocket-protocol") subProtocol = value;
                        if (headerName == "upgrade") upgradeRequested = value == "websocket";
                        if (headerName == "cookie")
                        {
                            foreach (var cookie in value.Split(';'))
                            {
                                var parts = cookie.Split('=');
                                if (parts.Length == 2)
                                {
                                    cookies[parts[0].Trim()] = parts[1].Trim();
                                }
                            }
                        }
                    }
                }

                // Have we received an upgrade request?
                var isUpgradeRequest = version == 13 && !string.IsNullOrEmpty(key) && upgradeRequested;
                if (!isUpgradeRequest)
                {
                    var response = new StringBuilder();
                    response.AppendLine("HTTP/1.1 400 WebSocket Server Only");
                    response.AppendLine();
                    response.AppendLine("WebSocket Server Only");
                    Socket.Send(Encoding.UTF8.GetBytes(response.ToString()));
                    Socket.Shutdown(SocketShutdown.Both);
                    Socket.Dispose();
                    HttpUpgradeFailed?.Invoke(this);
                    return;
                }

                // Process upgrade request
                if (version == 13 && !string.IsNullOrEmpty(key) && upgradeRequested)
                {
                    WebsocketVersion = version;
                    Cookies = cookies;
                    var returnKey = shaAlgorithm.ComputeHash(Encoding.UTF8.GetBytes(key + ProtocolKey));
                    var response = new StringBuilder();
                    response.AppendLine("HTTP/1.1 101 Switching Protocols");
                    response.AppendLine("Upgrade: websocket");
                    response.AppendLine("Connection: Upgrade");
                    response.AppendLine("Sec-WebSocket-Accept: " + Convert.ToBase64String(returnKey));
                    response.AppendLine("Sec-WebSocket-Protocol: " + subProtocol);
                    response.AppendLine();
                    Socket.Send(Encoding.UTF8.GetBytes(response.ToString()));
                    HttpUpgradeCompleted?.Invoke(this);
                    return;
                }

            }
            catch (ObjectDisposedException)
            {

                // "Standard practise", Microsoft says, for when the application is closing and the socket is closed
                return;
            }
            catch (Exception)
            {

                // Some other error, I.E. "existing connection was forcibly closed by the remote host"...etc
                DisconnectSocket();
                HttpUpgradeFailed?.Invoke(this);
            }
        }

    }

}
