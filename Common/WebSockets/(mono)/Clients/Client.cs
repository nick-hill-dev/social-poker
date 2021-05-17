using System.Net.Sockets;

namespace Common.WebSockets
{

    internal abstract class Client
    {

        internal Socket Socket { get; private set; }

        internal void DisconnectSocket()
        {
            try
            {
                if (Socket != null)
                {
                    Socket.Close();
                    Socket = null;
                }
            }
            catch
            {
            }
        }

        internal Client(Socket socket)
        {
            Socket = socket;
        }

    }

}
