const timeout = 5000;

describe(
  "/",
  () => {
    let page;
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage();
      await page.goto("http://127.0.0.1:3000");
    }, timeout);

    afterAll(async () => {
      await page.close();
    });

    it("should load without error", async () => {
      const a_text = await page.$eval("#target", (a) => a.innerText);
      expect(a_text).toContain("puppeteer");
    });
  },
  timeout
);
