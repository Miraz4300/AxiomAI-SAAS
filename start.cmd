cd ./service
start pnpm start > service.log &
echo "AxiomNode started!"


cd ..
echo "" > front.log
start pnpm dev > front.log &
echo "AxiomAI started!"