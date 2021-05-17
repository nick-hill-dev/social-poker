using System.ServiceProcess;
using WebSocketRelay.Properties;

namespace WebSocketRelay
{

    public partial class Service : ServiceBase
    {

        private Server host = null;

        public Service()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            host = new Server(Settings.Default.ServerPort);
        }

        protected override void OnStop()
        {
            if (host != null)
            {
                host.Dispose();
                host = null;
            }
        }

    }

}
