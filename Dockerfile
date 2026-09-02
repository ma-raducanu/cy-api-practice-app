FROM cypress/included:latest
WORKDIR /tests
COPY . /tests
RUN npm install
ENTRYPOINT []
CMD ["npm", "run", "cy-run-all"]
