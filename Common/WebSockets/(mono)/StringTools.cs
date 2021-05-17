using System.Collections.Generic;
using System.Text;

namespace Common.WebSockets
{

    /// <summary>
    /// This is a library of useful string utilities that work well with data sent and received by websocket clients.
    /// Most implementations of websocket may benefit from representing data as csv-style lines of text.
    /// The routines in this class facilitate that philosophy.
    /// </summary>
    public static class StringTools
    {

        /// <summary>
        /// Converts the given strings into a single line of csv-style text.
        /// </summary>
        /// <param name="parts">The strings to put together into a single line.</param>
        /// <returns>The csv-style representation of the specified strings (delimiter being ',' and quoted character being '"').</returns>
        public static string FromStringArray(params string[] parts)
        {
            var result = new StringBuilder();
            var first = true;
            foreach (var part in parts)
            {
                var fixedPart = part.Replace("\\", "\\\\").Replace("\"", "\\\"");
                if (part.Contains(" ") || part == string.Empty)
                {
                    fixedPart = "\"" + part + "\"";
                }
                if (first) { first = false; } else { result.Append(" "); }
                result.Append(fixedPart);
            }
            return result.ToString();
        }

        /// <summary>
        /// Converts the specified csv-style line into separate strings.
        /// </summary>
        /// <param name="line">The csv-style line to convert into separate strings (delimiter being ',' and quoted character being '"').</param>
        /// <returns>The set of strings that are contained in the specified csv-style line.</returns>
        public static string[] ToStringArray(string line)
        {

            // A blank line contains no data at all
            if (line == string.Empty) return new string[] { };

            // Initialise some variables for the DFA-based state machine
            var result = new List<string>();
            var lexerState = 0;
            string currentPart = null;

            // Process every character in the line
            for (int i = 0; i < line.Length; i++)
            {
                switch (lexerState)
                {

                    case 0:

                        // Lexer state 0 is the normal state
                        if (line[i] == ' ')
                        {
                            result.Add(currentPart);
                            currentPart = null;
                        }
                        else if (line[i] == '"')
                        {
                            if (currentPart == null) currentPart = string.Empty;
                            lexerState = 1;
                        }
                        else
                        {
                            if (currentPart == null) currentPart = string.Empty;
                            currentPart += line[i];
                        }
                        break;

                    case 1:

                        // Lexer state 1 is the quote-enclosed string state
                        if (line[i] == '"')
                        {
                            lexerState = 0;
                        }
                        else
                        {
                            currentPart += line[i];
                        }
                        break;

                }
            }

            // Return the parts (making sure to add the last part)
            result.Add(currentPart);
            return result.ToArray();

        }

    }

}
