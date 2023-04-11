
cd ./server
nohup pnpm start > server.log &
echo "Start server complete!"


cd ..
echo "" > front.log
nohup pnpm dev > front.log &
echo "Start front complete!"
tail -f front.log
