import { rest } from "msw";
import { employersPayload } from "../utils/testUtils";

const handlers = [
  rest.post("http://localhost:8080/api/verify", (req, res, ctx) => {
    return res(ctx.json({ score: 0.9 }), ctx.delay(150), ctx.status(200));
  }),

  rest.get("http://localhost:8080/api/sfaccts", (req, res, ctx) => {
    return res(ctx.json(employersPayload), ctx.status(200));
  }),

  rest.put("http://localhost:8080/api/sflookup", (req, res, ctx) => {
    return res(ctx.json({ id: "testid" }), ctx.status(200));
  }),

  rest.post("http://localhost:8080/api/sf", (req, res, ctx) => {
    return res(ctx.json({ id: "testid" }), ctx.status(200));
  })
];

export default handlers;
