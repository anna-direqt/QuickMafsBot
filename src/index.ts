import express, { Request, Response } from "express";
import { DireqtApi } from "direqt";
import { Expression } from "./quick-mafs"; // CHANGE THIS BACK

const direqt = new DireqtApi({
  accessToken:
    "yWWyTWHT1F3NSYzHMj1GqjbfARA9kPYBJ80Df-XjJ4DXIJOdHKmpg4zQ3uQK5kyM",
  signingSecret: "aJrJqyoeKSJoFFmqsLBl3w92KSk",
});

const app = express();

const rawBodyExtractor = (req: Request, res: Response, buf: Buffer) => {
  (<any>req).rawBody = buf.toString();
};

const startMsg =
  "Welcome to QuickMafs! \n*  Give me an expression of fractions [integer]/[integer], integers, and operators (*, /, +, -) and I'll calculate it.\n*  If you want to perform division, please put a space before and after /. This differentiates it from a fraction slash. \nHappy mathing :)";

app.use(
  "/calc",
  express.json({ verify: rawBodyExtractor }),
  direqt.messaging.verifyMiddleware(),
  (req, res) => {
    const { userId, userMessage } = req.body;
    const text = userMessage.content?.text;
    if (text === "start") {
      direqt.messaging.sendTextMessage(userId, startMsg);
    } else {
      const exp = new Expression(text);
      const result = text + " = " + exp.evaluate().toString();
      if (text) {
        console.log(text);
        direqt.messaging.sendTextMessage(userId, result);
      }
    }
    res.sendStatus(200);
  }
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
