using System;
using System.Collections.Generic;

namespace Common.WebSockets
{

    internal class PayloadHeader
    {

        internal bool FinishedBit { get; private set; }

        internal WebSocketOpCode OpCode { get; private set; }

        internal bool Masked { get; private set; }

        internal byte[] MaskKey { get; private set; }

        internal int PayloadLength { get; private set; }

        internal int Size { get; private set; }

        internal static PayloadHeader Decode(List<byte> buffer, int startPosition)
        {
            var header = new PayloadHeader();

            // Decode the first byte
            var position = startPosition;
            if (position >= buffer.Count) return null;
            header.FinishedBit = (buffer[position] & 128) == 128;
            header.OpCode = (WebSocketOpCode)(buffer[position] & 15);
            position++;

            // Decode the second byte
            if (position >= buffer.Count) return null;
            header.Masked = (buffer[position] & 128) == 128;
            header.PayloadLength = buffer[position] & 127;
            position++;

            // Calculate the real length of the payload (but exit if we don't have enough bytes)
            if (header.PayloadLength == 126)
            {
                if (position + 1 >= buffer.Count) return null;
                header.PayloadLength = (buffer[position++] << 8) | buffer[position++];
            }
            else if (header.PayloadLength == 127)
            {
                if (position + 7 >= buffer.Count) return null;
                header.PayloadLength = (buffer[position++] << 56) | (buffer[position++] << 48) | (buffer[position++] << 40) | (buffer[position++] << 32) | (buffer[position++] << 24) | (buffer[position++] << 16) | (buffer[position++] << 8) | buffer[position++];
            }

            // Get the mask key bytes
            if (header.Masked)
            {
                if (position + 3 >= buffer.Count) return null;
                header.MaskKey = new byte[4];
                buffer.CopyTo(position, header.MaskKey, 0, 4);
                position += 4;
            }

            // Return decoded payload header
            header.Size = position - startPosition;
            return header;
        }

        public override string ToString()
        {
            return string.Format("OpCode = {0}, Finished = {1}, Masked = {2}, Header Size = {3}, Payload Length = {4}", OpCode, FinishedBit, Masked, Size, PayloadLength);
        }

    }

}
