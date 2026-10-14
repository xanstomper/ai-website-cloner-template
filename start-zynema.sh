#!/bin/bash
# Launch Zynema (animesaga clone via template cloner) — Next.js standalone build on port 3000
cd /home/jewboy420/ai-website-cloner-template
PORT=3000 HOSTNAME=0.0.0.0 setsid node .next/standalone/server.js > /tmp/zynema-next.log 2>&1 &
echo "PID: $!"
sleep 3
echo "=== log ==="
cat /tmp/zynema-next.log
