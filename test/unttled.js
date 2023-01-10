const Page = require("puppeter/lib/Page");
const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");

Page.prototype.login = async function () {
  const user = await userFactory();

  const { session, sig } = sessionFactory(user);

  await this.setCookie({
    name: "session",
    value: session,
  });

  await this.setCookie({
    name: "session.sig",
    value: sig,
  });

  await this.goto("localhost:3000");

  await this.waitFor('a[href="/auth/logout"]');
};

// ...........//.............//..............

//......................//

class Page {
  goto() {
    console.log("I am going to another page");
  }
  setCookie() {
    console.log("I am setting a cookie");
  }
}

class CustomPage {
  constructor(page) {
    this.page = page;
  }

  login() {
    this.page.goto("localhost:3000");
    this.page.setCookie();
  }
}

const page = new Page();
const customPage = new CustomPage(page);
customPage.login();

const superPage = new Proxy(customPage, {
  get: function (target, property) {
    return target[property] || page[property];
  },
});

// .........build new page..............
const buildPage = () => {
  const page = new Page();
  const customPage = new CustomPage(page);

  const superPage = new Proxy(customPage, {
    get: function (target, property) {
      return target[property] || page[property];
    },
  });
  return superPage;
};

buildPage();
superPage.goto();
superPage.setCookie();
superPage.login();

// ....another method to build a page via static function...

class Page {
  goto() {
    console.log("I am going to another page");
  }
  setCookie() {
    console.log("I am setting a cookie");
  }
}

class CustomPage {
  static async build() {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = new Page();
    const customPage = new CustomPage(page);

    const superPage = new Proxy(customPage, {
      get: function (target, property) {
        return target[property] || page[property];
      },
    });
    return superPage;
  }

  constructor(page) {
    this.page = page;
  }

  login() {
    this.page.goto("localhost:3000");
    this.page.setCookie();
  }
}

const xx = CustomPage.build();

xx.goto();
xx.setCookie();
xx.login();

// .......another method to build a page via static function...

//...........................//

//.....proxies in action......//

class Greetings {
  english() {
    return "HEllo";
  }
  spanish() {
    return "Hola";
  }
}

class MoreGreetings {
  german() {
    return "Halo";
  }
  french() {
    return "Banjour";
  }
}

const greetings = new Greetings();

const moreGreetings = new MoreGreetings();

const allGreetings = new Proxy(moreGreetings, {
  get: function (target, property) {
    return target[property] || greetings[property];
  },
});

allGreetings.french();
