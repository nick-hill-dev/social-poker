using System.Collections.Generic;
using System.Diagnostics;

namespace WebSocketRelay
{

    [DebuggerDisplay("{ID,nq}")]
    public class Realm
    {

        public Realm Parent { get; set; }

        public long ID { get; private set; }

        public List<Realm> ChildRealms { get; private set; } = new List<Realm>();

        public List<User> Users { get; private set; } = new List<User>();

        internal Realm(Realm parent, long id)
        {
            Parent = parent;
            ID = id;
        }

    }

}
