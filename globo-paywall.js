;(() => {
  /**
   * removes paywall from https://oglobo.globo.com/ articles
   * usage:
   *  - go to article's page
   *  - open dev tools (ctrl+shift+i)
   *  - go to console tab
   *  - copy this script 
   *  - paste it over the console
   *  - hit enter
   *  - exit the dev tools (ctrl+shift+i)
   */
  if (typeof window === "undefined") {
    throw new ReferenceError("script only usable in a web browser environment")
  }
  const selectors = {
    modal: 'div[id="container-id"]',
    greyWall: 'div[class="barreiraJornada"]',
    html: 'html',
    footer: 'div[class="mobiliarioFooter"]',
  };
  for (const entry of Object.entries(selectors)) {
    const [element, selector] = entry;
    const domElement = document.querySelector(selector);
    if (domElement) {
      if (element === "html") {
        domElement.setAttribute("style", "touch-action: none;");
      } else {
        domElement.remove();
      } 
    }
  }
})()