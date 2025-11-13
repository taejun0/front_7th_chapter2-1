export class Router {
  constructor() {
    this.routes = new Map();
    this.currentPath = window.location.pathname;
    this.init();
  }

  init() {
    this.handleRoute();

    window.addEventListener("popstate", () => {
      this.currentPath = window.location.pathname;
      this.handleRoute();
    });

    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[data-link]");
      if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        if (href) {
          this.navigate(href);
        }
      }
    });
  }

  register(path, handler) {
    this.routes.set(path, handler);
  }

  navigate(path) {
    if (this.currentPath !== path) {
      this.currentPath = path;
      window.history.pushState({}, "", path);
      this.handleRoute();
    }
  }

  handleRoute() {
    const path = window.location.pathname;

    let handler = this.routes.get(path);

    if (!handler) {
      for (const [routePath, routeHandler] of this.routes.entries()) {
        if (routePath.includes(":")) {
          const pattern = routePath.replace(/:[^/]+/g, "([^/]+)");
          const regex = new RegExp(`^${pattern}$`);
          if (regex.test(path)) {
            handler = routeHandler;
            break;
          }
        }
      }
    }

    if (!handler) {
      handler = this.routes.get("/");
    }

    if (handler) {
      handler();
    }
  }
}
