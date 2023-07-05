
cd ./server
nohup pnpm start > server.log &
echo "AxiomNode started!"


cd ..
echo "" > front.log
nohup pnpm dev > front.log &
echo "AxiomAI started!"
tail -f front.log
