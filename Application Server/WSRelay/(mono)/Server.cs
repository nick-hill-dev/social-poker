using Common.WebSockets;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using WebSocketRelay.Properties;

namespace WebSocketRelay
{

    public class Server : IDisposable
    {

        private WebSocketServer server;

        private readonly Dictionary<long, Realm> realmsByID = new Dictionary<long, Realm>();

        private readonly Queue<long> reclaimableRealmIDs = new Queue<long>();

        private long nextRealmID = Settings.Default.PublicRealmCount;

        private readonly Dictionary<EndPoint, User> usersByEndPoint = new Dictionary<EndPoint, User>();

        private readonly Dictionary<long, User> usersByID = new Dictionary<long, User>();

        private readonly Queue<long> reclaimableUserIDs = new Queue<long>();

        private long nextUserID = 0;

        private readonly EntityManager entityManager = new EntityManager(Directory.GetCurrentDirectory());

        public Server(int port)
        {

            // Create a web socket server
            var status = "FAILED";
            try
            {
                server = new WebSocketServer(port);
                server.ClientConnected += Server_ClientConnected;
                server.ClientDisconnected += Server_ClientDisconnected;
                server.ClientSendText += Server_ClientSendText;
                server.LogDiagnostic += Server_LogDiagnostic;

                // Start the server now that we are ready
                server.Start();
                status = "SUCCESS";
            }
            finally
            {
                Log("Starting web socket server on port {0}: {1}.", port, status);
            }
        }

        private void Server_ClientConnected(EndPoint endPoint, Dictionary<string, string> cookies)
        {
            try
            {

                // Assign the user a specific user number, making an attempt to keep it low (i.e. use numbers that others have given up via disconnection)
                var userID = reclaimableUserIDs.Count > 0 ? reclaimableUserIDs.Dequeue() : nextUserID++;

                // Create a new user and add to the list
                var user = new User(userID, endPoint);
                usersByEndPoint.Add(endPoint, user);
                usersByID.Add(userID, user);

                // Advise user of user number
                Log("[Connected] {0} = {1}", endPoint, userID);
                Send(endPoint, "#" + userID);
            }
            catch (Exception ex)
            {
                Log(ex.Message);
            }
        }

        private void Server_ClientDisconnected(EndPoint endPoint, string reason)
        {
            try
            {

                // Remove user from the realm they are a part of
                var user = usersByEndPoint[endPoint];
                ChangeRealm(user, -1, false);

                // Remove from the users list
                usersByEndPoint.Remove(endPoint);
                usersByID.Remove(user.ID);

                // The user's number is now available            
                reclaimableUserIDs.Enqueue(user.ID);
                Log("[Disconnected] {0}", user.ID);
            }
            catch (Exception ex)
            {
                Log(ex.Message);
            }
        }

        private void Server_ClientSendText(EndPoint endPoint, string text)
        {
            try
            {

                // Ensure we have a valid line
                if (string.IsNullOrEmpty(text))
                {
                    return;
                }

                // Get the user that sent the command
                var user = (User)null;
                usersByEndPoint.TryGetValue(endPoint, out user);
                if (user == null)
                {
                    return;
                }
                Log("> {0}-{1} {2}", user.Realm == null ? "x" : user.Realm.ID.ToString(), user.ID, text);

                // Get the protocol fragment
                var spaceIndex = text.IndexOf(' ');
                var command = spaceIndex > 0 ? text.Substring(0, spaceIndex) : text;
                var message = spaceIndex > 0 ? text.Substring(spaceIndex + 1) : string.Empty;

                // Handle join realm commands
                var createFreeRealm = command.StartsWith("^");
                var createChildRealm = command.StartsWith("&");
                if (createFreeRealm || createChildRealm)
                {

                    // Get realm number, and in the case we're creating a new one, where necessary reuse an old realm number
                    var realmID = (long)0;
                    if (command.Length > 1)
                    {
                        long.TryParse(command.Substring(1), out realmID);
                    }
                    else
                    {
                        realmID = reclaimableRealmIDs.Count > 0 ? reclaimableRealmIDs.Dequeue() : nextRealmID++;
                    }

                    // Change realm
                    ChangeRealm(user, realmID, createChildRealm);
                }

                // Handle realm based commands
                if (user.Realm != null)
                {
                    if (command == "*")
                    {
                        CommandSendToAll(user, message);
                    }
                    else if (command == "!")
                    {
                        CommandSendExcept(user, message);
                    }
                    else if (command.StartsWith("@"))
                    {
                        CommandSendToUser(user, command, message);
                    }
                    else if (command.StartsWith(":"))
                    {
                        CommandSendToRealm(user, command, message);
                    }
                    else if (command.StartsWith("<"))
                    {
                        CommandLoadData(user, command);
                    }
                    else if (command.StartsWith(">"))
                    {
                        CommandSaveData(user, command, message);
                    }
                }
            }
            catch (Exception ex)
            {
                Log(ex.Message);
            }
        }

        private void Server_LogDiagnostic(Exception exception)
        {
            ExceptionLogger.LogException("WebSocket library logged a diagnostic exception.", exception);
        }

        private void CommandSendToAll(User sender, string message)
        {
            foreach (var realmUser in sender.Realm.Users)
            {
                Send(realmUser.EndPoint, "*" + sender.ID + " " + message);
            }
        }

        private void CommandSendExcept(User sender, string message)
        {
            foreach (var realmUser in sender.Realm.Users.Where(u => u != sender))
            {
                Send(realmUser.EndPoint, "!" + sender.ID + " " + message);
            }
        }

        private void CommandSendToUser(User sender, string command, string message)
        {
            var targetUserNumber = (long)0;
            var targetUser = (User)null;
            if (long.TryParse(command.Substring(1), out targetUserNumber) && usersByID.TryGetValue(targetUserNumber, out targetUser))
            {
                Send(targetUser.EndPoint, "@" + sender.ID + " " + message);
            }
        }

        private void CommandSendToRealm(User sender, string command, string message)
        {
            var targetRealmNumber = (long)0;
            var targetRealm = (Realm)null;
            if (long.TryParse(command.Substring(1), out targetRealmNumber) && realmsByID.TryGetValue(targetRealmNumber, out targetRealm) && targetRealm.Users.Count > 0)
            {
                var targetUser = targetRealm.Users.First();
                Send(targetUser.EndPoint, "@" + sender.ID + " " + message);
            }
        }

        private void CommandLoadData(User sender, string command)
        {
            var realmNumber = sender.Realm.ID;
            var entityName = command.Substring(1);
            var splitterIndex = entityName.IndexOf(',');
            if (splitterIndex != -1)
            {
                if (!long.TryParse(entityName.Substring(0, splitterIndex), out realmNumber))
                {
                    return;
                }
                entityName = entityName.Substring(splitterIndex + 1);
            }
            if (!string.IsNullOrEmpty(entityName) && entityName.All(c => char.IsLetterOrDigit(c) || c == '_'))
            {
                var fragment = realmNumber == sender.Realm.ID ? entityName : realmNumber + "," + entityName;
                var data = entityManager.LoadData(realmNumber, entityName);
                if (data == string.Empty)
                {
                    Send(sender.EndPoint, "<" + fragment);
                }
                else
                {
                    Send(sender.EndPoint, "<" + fragment + " " + data);
                }
            }
        }

        private void CommandSaveData(User sender, string command, string message)
        {
            var entityName = command.Substring(1);
            var commaIndex = entityName.IndexOf(',');
            var time = 0D;
            if (commaIndex != -1)
            {
                double.TryParse(entityName.Substring(commaIndex + 1), out time);
                entityName = entityName.Substring(0, commaIndex);
            }
            if (!string.IsNullOrEmpty(entityName) && entityName.All(c => char.IsLetterOrDigit(c) || c == '_'))
            {
                entityManager.SaveData(sender.Realm.ID, entityName, time, message);
            }
        }

        private void ChangeRealm(User user, long targetRealmID, bool createChildRealm)
        {

            // Don't do anything if the user is staying in the same realm
            if ((user.Realm == null && targetRealmID == -1) ||
                (user.Realm != null && user.Realm.ID == targetRealmID))
            {
                return;
            }

            // Child realms can only be created if user is currently in a realm
            var oldRealm = user.Realm;
            if (oldRealm == null && createChildRealm)
            {
                createChildRealm = false;
            }

            // Remove user from the old realm, informing everyone that the user has left it
            if (oldRealm != null)
            {
                oldRealm.Users.Remove(user);
                user.Realm = null;
                foreach (var realmUser in oldRealm.Users)
                {
                    Send(realmUser.EndPoint, "-" + user.ID);
                }
            }

            // Get the target realm, creating it if necessary
            var newRealm = (Realm)null;
            if (targetRealmID != -1)
            {
                if (!realmsByID.TryGetValue(targetRealmID, out newRealm))
                {
                    var parentRealm = createChildRealm ? oldRealm : null;
                    newRealm = new Realm(parentRealm, targetRealmID);
                    realmsByID.Add(targetRealmID, newRealm);
                    if (parentRealm != null)
                    {
                        parentRealm.ChildRealms.Add(newRealm);
                    }
                }

                // Add the user to the new realm
                newRealm.Users.Add(user);
                user.Realm = newRealm;

                // Advise user that the new realm has been joined successfully
                Send(user.EndPoint, (createChildRealm ? "&" : "^") + targetRealmID);

                // Advise user of all child realms already existing in the new realm
                foreach (var realm in newRealm.ChildRealms)
                {
                    Send(user.EndPoint, "{" + realm.ID);
                }

                // Advise user of all other users already connected to that realm
                var otherRealmUsers = newRealm.Users.Where(u => u != user).ToArray();
                Send(user.EndPoint, "=" + string.Join(",", otherRealmUsers.Select(u => u.ID)));

                // Advise everyone in the target realm that user has joined
                foreach (var realmUser in otherRealmUsers)
                {
                    Send(realmUser.EndPoint, "+" + user.ID);
                }
            }

            // Advise everyone in the old realm that there is a new child realm
            if (createChildRealm)
            {
                foreach (var realmUser in oldRealm.Users)
                {
                    Send(realmUser.EndPoint, "{" + newRealm.ID);
                }
            }

            // If there aren't any more users or child realms in the old realm then recursively destroy the old realm(s)
            var currentRealm = oldRealm;
            while (!createChildRealm && currentRealm != null && currentRealm.Users.Count == 0 && currentRealm.ChildRealms.Count == 0)
            {

                // Remove the realm from the parent's child list
                if (currentRealm.Parent != null)
                {
                    currentRealm.Parent.ChildRealms.Remove(currentRealm);

                    // Advise users of the parent realm that the child realm has been destroyed
                    foreach (var realmUser in currentRealm.Parent.Users)
                    {
                        Send(realmUser.EndPoint, "}" + currentRealm.ID);
                    }
                }

                // Remove realm data
                if (currentRealm.ID >= Settings.Default.PublicRealmCount)
                {
                    foreach (var fileName in Directory.GetFiles(".", "realm." + currentRealm.ID + ".*.entity"))
                    {
                        File.Delete(fileName);
                    }
                }

                // Remove the realm from the list
                if (currentRealm.ID >= Settings.Default.PublicRealmCount)
                {
                    reclaimableRealmIDs.Enqueue(currentRealm.ID);
                }
                realmsByID.Remove(currentRealm.ID);

                // Move on to checking parent realm
                currentRealm = currentRealm.Parent;
            }
        }

        private void Send(EndPoint endPoint, string text)
        {
            var user = usersByEndPoint[endPoint];
            Log("< {0}-{1} {2}", user.Realm == null ? "x" : user.Realm.ID.ToString(), user.ID, text);
            server.Send(endPoint, text);
        }

        private void Log(string message, params object[] args)
        {
            if (Environment.UserInteractive)
            {
                if (args == null || args.Length == 0)
                {
                    Console.WriteLine(message);
                }
                else
                {
                    Console.WriteLine(message, args);
                }
            }
        }

        public void Dispose()
        {
            if (server != null)
            {
                server.Stop();
                server = null;
            }
        }

    }

}