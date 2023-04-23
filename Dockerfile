# Back-end: AxiomNode
FROM node:lts-alpine as backend
RUN npm install pnpm -g
WORKDIR /app
COPY /server/package.json /app
COPY /server/pnpm-lock.yaml /app
RUN pnpm install
COPY /server /app
RUN pnpm build

# Build Final Image
FROM node:lts-alpine
RUN npm install pnpm -g
WORKDIR /app
COPY /server/package.json /app
COPY /server/pnpm-lock.yaml /app
RUN pnpm install --production && rm -rf /root/.npm /root/.pnpm-store /usr/local/share/.cache /tmp/*
COPY /server /app
COPY --from=backend /app/build /app/build
COPY --from=backend /app/src/utils/templates /app/build/templates
EXPOSE 10829

CMD ["pnpm", "run", "prod"]
