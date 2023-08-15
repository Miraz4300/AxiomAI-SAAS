# Front-end: AxiomUI
FROM node:lts-alpine AS frontend
RUN npm install -g pnpm@latest
WORKDIR /app
COPY ./package.json /app
COPY ./pnpm-lock.yaml /app
RUN pnpm install
COPY . /app
RUN pnpm run build

# Back-end: AxiomNode
FROM node:lts-alpine as backend
RUN npm install -g pnpm@latest
WORKDIR /app
COPY /service/package.json /app
COPY /service/pnpm-lock.yaml /app
RUN pnpm install
COPY /service /app
RUN pnpm build

# Build Final Image: AxiomAI
FROM node:lts-alpine
RUN npm install -g pnpm@latest
WORKDIR /app
COPY /service/package.json /app
COPY /service/pnpm-lock.yaml /app
RUN pnpm install --production && rm -rf /root/.npm /root/.pnpm-store /usr/local/share/.cache /tmp/*
COPY /service /app
COPY --from=frontend /app/dist /app/public
COPY --from=backend /app/build /app/build
COPY --from=backend /app/src/utils/templates /app/build/templates
EXPOSE 10829

CMD ["sh", "-c", "pnpm run prod"]