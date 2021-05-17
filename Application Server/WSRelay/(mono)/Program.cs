using System;
using System.IO;
using System.Reflection;
using System.ServiceProcess;
using WebSocketRelay.Properties;

namespace WebSocketRelay
{

    public static class Program
    {

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        public static void Main(string[] args)
        {

            // Change directory
            var assembly = Assembly.GetExecutingAssembly();
            Directory.SetCurrentDirectory(Path.GetDirectoryName(assembly.Location));

            // Catch terminal errors
            var currentDomain = AppDomain.CurrentDomain;
            currentDomain.UnhandledException += CurrentDomain_UnhandledException;

            // Load assembly information            
            var version = assembly.GetName().Version;
            var titleAttribute = (AssemblyTitleAttribute)Attribute.GetCustomAttribute(assembly, typeof(AssemblyTitleAttribute), true);
            var copyrightAttribute = (AssemblyCopyrightAttribute)Attribute.GetCustomAttribute(assembly, typeof(AssemblyCopyrightAttribute), true);

            // Show header            
            Console.WriteLine("{0} v{1}", titleAttribute.Title, version);
            Console.WriteLine(copyrightAttribute.Copyright);
            Console.WriteLine();

            // Start server
            if (Environment.UserInteractive || args.Length > 0)
            {
                using (var server = new Server(Settings.Default.ServerPort))
                {
                    Console.WriteLine("WebSocket Server started. Press any key to terminate the server.");
                    Console.ReadKey(true);
                }
            }
            else
            {
                var servicesToRun = new ServiceBase[] { new Service() };
                ServiceBase.Run(servicesToRun);
            }
        }

        private static void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            var ex = e.ExceptionObject as Exception;
            if (ex != null)
            {
                ExceptionLogger.LogException("Catastrophic unhandled error.", ex);
            }
        }

    }

}
