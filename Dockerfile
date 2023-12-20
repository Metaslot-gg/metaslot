FROM node:16-alpine
RUN npm install -g pnpm@8.7.0
RUN mkdir -p /app
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run --filter ./frontend build
CMD ["pnpm", "run", "--filter", "./frontend", "start"]
# COPY ./frontend/ .
# COPY next.config.js .
# RUN yarn install
# RUN yarn build
# CMD [ "yarn", "start" ]
