# Front-end: AxiomUI
FROM node:20-alpine AS frontend
RUN npm install -g pnpm@latest
WORKDIR /app
COPY ./package.json /app
COPY ./pnpm-lock.yaml /app
RUN pnpm install
COPY . /app
RUN pnpm run build

# Back-end: AxiomNode
FROM node:20-alpine as backend
RUN npm install -g pnpm@latest
WORKDIR /app
COPY /service/package.json /app
COPY /service/pnpm-lock.yaml /app
RUN pnpm install
COPY /service /app
RUN pnpm build

# Build Final Image: AxiomAI
FROM node:20-alpine
RUN npm install -g pnpm@latest
WORKDIR /app
COPY /service/package.json /app
COPY /service/pnpm-lock.yaml /app
RUN pnpm install --production && rm -rf /root/.npm /root/.pnpm-store /usr/local/share/.cache /tmp/*
COPY /service /app
COPY --from=frontend /app/dist /app/public
COPY --from=backend /app/build /app/build
RUN mkdir /app/logs
EXPOSE 10829

CMD ["sh", "-c", "node --import tsx/esm ./build/index.js"]
