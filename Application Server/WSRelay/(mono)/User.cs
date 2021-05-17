using System.Diagnostics;
using System.Net;

namespace WebSocketRelay
{

    [DebuggerDisplay("{ID,nq}: {EndPoint,nq}")]
    public class User
    {

        public long ID { get; private set; }

        public EndPoint EndPoint { get; private set; }

        public Realm Realm { get; set; }

        internal User(long id, EndPoint endPoint)
        {
            ID = id;
            EndPoint = endPoint;            
        }

    }

}
