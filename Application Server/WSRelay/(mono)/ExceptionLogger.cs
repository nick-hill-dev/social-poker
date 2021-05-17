using System;
using System.IO;

namespace WebSocketRelay
{

    public static class ExceptionLogger
    {

        public static void LogException(string message, Exception exceptionDetails)
        {
            File.AppendAllText("Exceptions.txt",
                               "[ " + DateTime.Now.ToString() + ": " + message + " ]" + Environment.NewLine +
                               exceptionDetails.GetType().FullName +
                               exceptionDetails.Message + Environment.NewLine +
                               exceptionDetails.StackTrace);
        }

    }

}
