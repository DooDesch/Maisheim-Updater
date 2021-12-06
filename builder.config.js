const ICONS_DIR = "build/icons/";

const windowsOS = {
  win: {
    icon: ICONS_DIR + "win-icon.ico",
    publisherName: "DooDesch",
    target: "nsis",
    publish: ["github"],
  },

  nsis: {
    differentialPackage: false,
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Maisheim Updater",
  },
};

const linuxOS = {
  linux: {
    icon: ICONS_DIR,
    target: "deb",
  },
};

const macOS = {
  mac: {
    target: "dmg",
    icon: ICONS_DIR + "con.icns",
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: "link",
        path: "/Applications",
      },
      {
        x: 130,
        y: 150,
        type: "file",
      },
    ],
  },
};

module.exports = {
  productName: "Maisheim Mods Updater",
  appId: "(com.valheim.mods.updater.app)",
  artifactName: "setup-${version}.${ext}",
  publish: {
    provider: "github",
    repo: "Maisheim-Updater",
    owner: "DooDesch",
    releaseType: "draft",
  },
  directories: {
    output: "build",
  },
  // default files: https://www.electron.build/configuration/contents
  files: [
    "package.json",
    {
      from: "dist/main/",
      to: "dist/main/",
    },
    {
      from: "dist/renderer",
      to: "dist/renderer/",
    },
  ],
  extraResources: [
    {
      from: "src/extraResources/",
      to: "",
    },
  ],
  ...windowsOS,
  ...linuxOS,
  ...macOS,
};
