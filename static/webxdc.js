// webxdc.js mock for local development
window.webxdc = (() => {
  var updateHandler = (updates) => {};
  var selfAddr = window.localStorage.getItem("webxdc_self_addr") || "user@example.org";
  var selfName = window.localStorage.getItem("webxdc_self_name") || "User";

  return {
    sendUpdate: (update, description) => {
      console.log("webxdc.sendUpdate", update, description);
    },
    setUpdateListener: (cb) => {
      updateHandler = cb;
      cb([]);
    },
    selfAddr: selfAddr,
    selfName: selfName,
    setSelfAddr: (addr) => {
      selfAddr = addr;
      window.localStorage.setItem("webxdc_self_addr", addr);
    },
    setSelfName: (name) => {
      selfName = name;
      window.localStorage.setItem("webxdc_self_name", name);
    },
    getAppInfo: () => {
      return {
        name: "News Reader",
        version: "0.0.1",
        description: "A webxdc app to decompress and show conversations from files."
      };
    }
  };
})();
