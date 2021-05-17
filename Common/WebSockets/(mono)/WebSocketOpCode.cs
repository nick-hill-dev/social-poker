namespace Common.WebSockets
{

    internal enum WebSocketOpCode : byte
    {
        Continuation = 0,
        Text = 1,
        Binary = 2,
        Reserved3 = 3,
        Reserved4 = 4,
        Reserved5 = 5,
        Reserved6 = 6,
        Reserved7 = 7,
        Close = 8,
        Ping = 9,
        Pong = 10,
        ReservedB = 11,
        ReservedC = 12,
        ReservedD = 13,
        ReservedE = 14,
        ReservedF = 15
    }

}
