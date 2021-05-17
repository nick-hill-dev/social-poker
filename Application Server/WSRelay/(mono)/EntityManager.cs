using System;
using System.IO;

namespace WebSocketRelay
{

    public class EntityManager
    {

        private readonly string path;

        public EntityManager(string path)
        {
            this.path = path;
            Upgrade();
        }

        public string LoadData(long realmNumber, string entityName)
        {
            var fileName = GetFileName(realmNumber, entityName);
            if (!File.Exists(fileName))
            {
                return string.Empty;
            }

            var allData = File.ReadAllText(fileName);
            var spaceIndex = allData.IndexOf(' ');
            var metaData = allData.Substring(0, spaceIndex);
            if (DateTime.UtcNow.Ticks > long.Parse(metaData))
            {
                File.Delete(fileName);
                return string.Empty;
            }

            return allData.Substring(spaceIndex + 1);
        }

        public void SaveData(long realmNumber, string entityName, double time, string message)
        {
            var fileName = GetFileName(realmNumber, entityName);
            if (message == string.Empty)
            {
                if (File.Exists(fileName))
                {
                    File.Delete(fileName);
                }
            }
            else
            {
                var metadata = time == 0 ? 0 : DateTime.UtcNow.AddSeconds(time).Ticks;
                File.WriteAllText(fileName, metadata + " " + message);
            }
        }

        private void Upgrade()
        {
            foreach (var fileName in Directory.GetFiles(path, "*.entity"))
            {
                var data = File.ReadAllText(fileName);
                File.WriteAllText(Path.ChangeExtension(fileName, ".e"), "0 " + data);
                File.Delete(fileName);
            }
        }

        private string GetFileName(long realmNumber, string entityName)
        {
            var fileName = "realm." + realmNumber + "." + entityName + ".e";
            return Path.Combine(path, fileName);
        }

    }

}
