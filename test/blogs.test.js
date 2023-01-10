const Page = require("./helpers/page");

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

describe("When logged In", () => {
  beforeEach(async () => {
    await page.login();
    await page.click("a.btn-floating");
  });

  test("Can see blog creation form", async () => {
    const label = await page.getContentsOf("form label");
    expect(label).toEqual("Blog Title");
  });

  describe("And using valid inputs", async () => {
    beforeEach(async () => {
      await page.type(".title input", "My Title");
      await page.type(".content input", "My Content");
      await page.click("form button");
    });

    test("submitting  takes user to review screen", async () => {
      const text = await page.getContentsOf("h5");
      expect(text).toEqual("Please confirm your entries");
    });

    test("submitting then saving takes user to index screen", async () => {
      await page.click("button.green");
      await page.waitFor(".card");

      const title = await page.getContentsOf(".card-title");
      const content = await page.getContentsOf("p");
      expect(title).toEqual("My Title");
      expect(content).toEqual("My Content");
    });
  });

  describe("And using Invalid inputs", async () => {
    beforeEach(async () => {
      await page.click("form button");
    });

    test("form shows error message", async () => {
      const titleError = await page.getContentsOf(".title .red-text");
      const contentError = await page.getContentsOf(".content .red-text");
      expect(titleError).toEqual("You must provide a value");
      expect(contentError).toEqual("You must provide a value");
    });
  });
});

describe.only("When user not logged In", async () => {
  const actions = [
    {
      method: "get",
      path: "/api/blogs",
    },
    {
      method: "post",
      path: "/api/blogs",
      data: {
        title: "My Title",
        content: "My Content",
      },
    },
  ];

  test("Blog related actions are prohibited", async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({ error: "You must log in!" });
    }
  });
});
