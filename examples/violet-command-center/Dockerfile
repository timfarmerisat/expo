FROM node:22-alpine

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4173

WORKDIR /app
COPY --chown=node:node package.json server.mjs index.html app.webmanifest icon.svg sw.js ./
COPY --chown=node:node src ./src
USER node
EXPOSE 4173
CMD ["node", "server.mjs"]
