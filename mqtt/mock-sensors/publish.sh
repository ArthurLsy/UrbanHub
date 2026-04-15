#!/bin/sh
set -e

BROKER="${MQTT_BROKER:-mosquitto}"
PORT="${MQTT_PORT:-1883}"
INTERVAL="${PUBLISH_INTERVAL:-5}"
TOPIC_PREFIX="urbanhub/sensors"

echo "Waiting for broker $BROKER:$PORT ..."
until mosquitto_pub -h "$BROKER" -p "$PORT" -t "ping" -m "hello" -q 0 2>/dev/null; do
  sleep 1
done
echo "Broker ready – publishing every ${INTERVAL}s"

rand_float() {
  min=$1 max=$2
  awk -v min="$min" -v max="$max" 'BEGIN { srand(); printf "%.1f", min + rand() * (max - min) }'
}

rand_int() {
  min=$1 max=$2
  awk -v min="$min" -v max="$max" 'BEGIN { srand(); printf "%d", min + rand() * (max - min) }'
}

while true; do
  TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Air quality sensor (PM2.5 µg/m³)
  VAL=$(rand_float 5 80)
  mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC_PREFIX/air/sensor-air-001" -m \
    "{\"sensor_id\":\"sensor-air-001\",\"type\":\"air\",\"timestamp\":\"$TS\",\"location\":\"49.1829;-0.3707\",\"value\":$VAL,\"unit\":\"µg/m³\"}"

  # Noise sensor (dB)
  VAL=$(rand_float 30 90)
  mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC_PREFIX/noise/sensor-noise-001" -m \
    "{\"sensor_id\":\"sensor-noise-001\",\"type\":\"noise\",\"timestamp\":\"$TS\",\"location\":\"49.1812;-0.3695\",\"value\":$VAL,\"unit\":\"dB\"}"

  # Traffic sensor (vehicles/min)
  VAL=$(rand_int 0 120)
  mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC_PREFIX/traffic/sensor-traffic-001" -m \
    "{\"sensor_id\":\"sensor-traffic-001\",\"type\":\"traffic\",\"timestamp\":\"$TS\",\"location\":\"49.1835;-0.3720\",\"value\":$VAL,\"unit\":\"vehicles/min\"}"

  # Weather sensor (°C)
  VAL=$(rand_float -5 35)
  mosquitto_pub -h "$BROKER" -p "$PORT" -t "$TOPIC_PREFIX/weather/sensor-weather-001" -m \
    "{\"sensor_id\":\"sensor-weather-001\",\"type\":\"weather\",\"timestamp\":\"$TS\",\"location\":\"49.1820;-0.3710\",\"value\":$VAL,\"unit\":\"°C\"}"

  echo "[$TS] Published 4 measures"
  sleep "$INTERVAL"
done
