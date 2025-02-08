import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetTimestamp }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    function calculateTimeLeft() {
        // 检查 targetTimestamp 是否是 BigInt 类型，并转换为 Number
        const timestamp = typeof targetTimestamp === 'bigint' ? Number(targetTimestamp) : targetTimestamp;

        // 如果 timestamp 是 0 或无效值，直接返回空对象
        if (!timestamp || timestamp === 0) {
            return {};
        }

        const difference = +new Date(timestamp) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    }

    const formatTime = (time) => {
        return time < 10 ? `0${time}` : time;
    };

    return (
        <div>
            {timeLeft.days !== undefined ? (
                <span>
                    {timeLeft.days}天 {formatTime(timeLeft.hours)}:
                    {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                </span>
            ) : (
                <span>时间已到</span>
            )}
        </div>
    );
};

export default CountdownTimer;