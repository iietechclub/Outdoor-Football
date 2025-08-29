import { useEffect, useMemo, useState } from "react";
import useSocket from "../context/SocketProvider";

let timerId: number | null = null;

export default function useTimer() {
  const [time, setTime] = useState<number | null>(null);
  const { socket, isConnected } = useSocket();

  function startTimer(remainingTime: number) {
    if (timerId) pauseTimer();

    setTime(remainingTime);
    resumeTimer();
  }

  function resumeTimer() {
    if (timerId) return;

    timerId = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime === null) return 0;

        if (prevTime <= 0) {
          stopTimer();
          socket?.emit("match:request");
          return 0;
        }

        return prevTime - 1;
      });
    }, 1000);
  }

  function pauseTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function stopTimer() {
    pauseTimer();
    setTime(null);
  }

  useEffect(() => {
    console.log("Socket connected:", socket?.id);
    if (!socket) return;

    socket.emit("timer:request");

    socket.on("timer:start", (remainingTime: number) => {
      startTimer(remainingTime < 0 ? 0 : remainingTime);
    });

    socket.on("timer:update", (remainingTime: number) =>
      setTime(remainingTime < 0 ? 0 : remainingTime),
    );

    socket.on("timer:pause", (remainingTime: number) => {
      console.log("Timer paused:", remainingTime);
      setTime(remainingTime < 0 ? 0 : remainingTime);
      pauseTimer();
    });

    socket.on("timer:resume", (remainingTime: number) => {
      setTime(remainingTime < 0 ? 0 : remainingTime);
      resumeTimer();
    });

    socket.on("timer:stop", stopTimer);

    return () => {
      socket.off("timer:start");
      socket.off("timer:update");
      socket.off("timer:pause");
      socket.off("timer:resume");
      socket.off("timer:stop");
    };
  }, [socket, isConnected]);

  const formatTime = (time: number | null) => {
    if (!time) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return (
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0")
    );
  };

  const timeString = useMemo(() => formatTime(time), [time]);
  return timeString;
}
