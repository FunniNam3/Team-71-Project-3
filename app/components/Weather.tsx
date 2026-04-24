"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type Location = {
  latitude: number;
  longitude: number;
};

type WeatherData = {
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    timezoneAbbreviation: string;
  };
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    is_day: number;
    cloud_cover: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: Record<string, number>;
    temperature_2m_min: Record<string, number>;
  };
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CloudIcon({ cover }: { cover: number }) {
  const cloudOpacity = 0.3 + (cover / 100) * 0.55;
  const sunOpacity = 1 - cloudOpacity * 0.8;
  return (
    <svg width="52" height="40" viewBox="0 0 52 40" fill="none">
      <circle cx="12" cy="18" r="8" fill="#FCD34D" opacity={sunOpacity} />
      <line
        x1="12"
        y1="6"
        x2="12"
        y2="3"
        stroke="#FCD34D"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={sunOpacity}
      />
      <line
        x1="20"
        y1="10"
        x2="22"
        y2="8"
        stroke="#FCD34D"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={sunOpacity}
      />
      <line
        x1="4"
        y1="10"
        x2="2"
        y2="8"
        stroke="#FCD34D"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={sunOpacity}
      />
      <ellipse
        cx="30"
        cy="28"
        rx="18"
        ry="9"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.75"
        opacity={cloudOpacity + 0.2}
      />
      <circle
        cx="20"
        cy="26"
        r="8"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.75"
        opacity={cloudOpacity + 0.2}
      />
      <circle
        cx="34"
        cy="22"
        r="10"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.75"
        opacity={cloudOpacity + 0.2}
      />
      <circle
        cx="43"
        cy="27"
        r="7"
        fill="white"
        stroke="#e2e8f0"
        strokeWidth="0.75"
        opacity={cloudOpacity + 0.2}
      />
    </svg>
  );
}

function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
  );
}

function StatChip({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-2">
      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
        {label}
      </div>
      {loading ? (
        <Skeleton className="w-9 h-5 mt-1" />
      ) : (
        <div className="text-base font-semibold text-slate-900 mt-0.5">
          {value}
        </div>
      )}
    </div>
  );
}

export default function WeatherCard() {
  const [show, setShow] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getWeather() {
      let location: Location = { latitude: 30.6187, longitude: -96.3364 };

      await new Promise<void>((resolve) => {
        if (!navigator.geolocation) return resolve();
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            location = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
            resolve();
          },
          () => resolve(),
          { timeout: 4000 },
        );
      });

      try {
        const res = await fetch(
          `api/weather?latitude=${location.latitude}&longitude=${location.longitude}`,
        );
        const json = await res.json();
        setWeather(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    getWeather();
  }, []);

  const forecastDays = weather
    ? Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weather.daily.time[i]);
        return {
          label: i === 0 ? "Today" : DAY_NAMES[date.getUTCDay()],
          hi: Math.round(weather.daily.temperature_2m_max[i]),
          lo: Math.round(weather.daily.temperature_2m_min[i]),
          isToday: i === 0,
        };
      })
    : [];

  return show ? (
    <button
      onClick={() => setShow(false)}
      className="absolute mt-20 top-0 left-0 p-6 z-10 hover:scale-105 active:scale-95 transition-transform duration-300"
    >
      <div className="w-80 rounded-2xl border border-black/10 bg-white/90 backdrop-blur-md p-5 shadow-xl shadow-black/10">
        {/* Location */}
        <div className="flex items-center gap-1.5 mb-4">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M6 1C4.07 1 2.5 2.57 2.5 4.5c0 2.81 3.5 6.5 3.5 6.5s3.5-3.69 3.5-6.5C9.5 2.57 7.93 1 6 1zm0 4.75a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z"
              fill="#94a3b8"
            />
          </svg>
          {loading ? (
            <Skeleton className="w-36 h-3.5" />
          ) : (
            <span className="text-[13px] text-slate-500 font-medium">
              {weather?.location.latitude.toFixed(2)}°N ·{" "}
              {Math.abs(weather?.location.longitude ?? 0).toFixed(2)}°W
            </span>
          )}
        </div>

        {/* Hero */}
        <div className="flex items-end justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            {loading ? (
              <>
                <Skeleton className="w-24 h-14 mb-2" />
                <Skeleton className="w-20 h-3.5" />
              </>
            ) : (
              <>
                <div className="flex items-start leading-none">
                  <span className="text-6xl font-semibold tracking-tighter text-slate-900">
                    {Math.round(weather!.current.temperature_2m)}
                  </span>
                  <span className="text-2xl font-normal text-slate-400 pt-2.5">
                    °F
                  </span>
                </div>
                <div className="text-[13px] text-slate-400 mt-1">
                  Feels like {Math.round(weather!.current.apparent_temperature)}
                  °
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            {loading ? (
              <Skeleton className="w-14 h-10" />
            ) : (
              <>
                <CloudIcon cover={weather!.current.cloud_cover} />
                <span className="text-[11px] text-slate-400">
                  {weather!.current.cloud_cover}% clouds
                </span>
              </>
            )}
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatChip
            label="High"
            value={`${Math.round(weather?.daily.temperature_2m_max[0] ?? 0)}°`}
            loading={loading}
          />
          <StatChip
            label="Low"
            value={`${Math.round(weather?.daily.temperature_2m_min[0] ?? 0)}°`}
            loading={loading}
          />
          <StatChip
            label="Elevation"
            value={`${weather?.location.elevation}m`}
            loading={loading}
          />
        </div>

        {/* 7-day forecast */}
        <div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mb-2">
            7-day forecast
          </div>
          <div className="grid grid-cols-7 gap-1">
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))
              : forecastDays.map((day) => (
                  <div
                    key={day.label}
                    className={`rounded-xl py-1.5 px-0.5 text-center transition-colors ${
                      day.isToday
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-slate-50 hover:bg-blue-50"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-medium mb-0.5 ${
                        day.isToday ? "text-blue-400" : "text-slate-400"
                      }`}
                    >
                      {day.label}
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        day.isToday ? "text-blue-700" : "text-slate-900"
                      }`}
                    >
                      {day.hi}°
                    </div>
                    <div className="text-[10px] text-slate-300">{day.lo}°</div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </button>
  ) : (
    <button
      className="p-3 h-full w-auto z-10 bg-(--primary) rounded-full aspect-square hover:scale-105 active:scale-95 transition-transform duration-300"
      onClick={() => setShow(true)}
    >
      <Image
        src="/Weather.svg"
        alt="Weather"
        width={22.01}
        height={16}
        className="w-full h-auto"
      />
    </button>
  );
}
