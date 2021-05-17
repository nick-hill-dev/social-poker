using System;
using System.Net.Sockets;
using System.Text;

namespace Common.WebSockets
{

    internal class HttpClientRequest
    {

        private const int BufferSize = 8192;

        internal Socket Socket { get; private set; }

        internal byte[] Buffer { get; set; } = new byte[BufferSize];

        internal StringBuilder RequestText { get; private set; } = new StringBuilder();

        internal HttpClientRequest(Socket socket)
        {
            Socket = socket;
        }

        internal void BeginReceive(AsyncCallback callback)
        {
            Socket.BeginReceive(Buffer, 0, BufferSize, 0, callback, this);
        }

    }

}
