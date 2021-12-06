<template>
  <v-app id="inspire">
    <v-app-bar app flat>
      <v-container class="py-0 fill-height">
        <v-avatar
          class="mr-10"
          size="32"
          :color="`${currentStateColor} darken-1`"
        ></v-avatar>

        <!-- <v-btn v-for="link in links" :key="link" text>
          {{ link }}
        </v-btn> -->

        <v-spacer></v-spacer>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="error"
              v-bind="attrs"
              v-on="on"
              @click="resetDialog = true"
            >
              Reset mods
            </v-btn>
          </template>
          <span>Resets config and plugins to current head</span>
        </v-tooltip>
      </v-container>
    </v-app-bar>

    <v-main class="grey lighten-3">
      <v-container>
        <v-row>
          <v-col cols="12" style="position: relative">
            <v-sheet
              dark
              rounded="lg"
              class="pt-4 px-4 pb-1 scroll"
              :class="{ expanded: consoleExpanded }"
              ref="consoleLogs"
            >
              <v-alert
                dark
                dense
                text
                prominent
                class="mb-3"
                v-for="(log, index) in console"
                :key="index"
                :type="log.type"
              >
                {{ log.msg }}
              </v-alert>
            </v-sheet>
            <v-fab-transition>
              <v-btn
                dark
                absolute
                bottom
                right
                fab
                small
                class="mb-4 mr-4"
                color="primary"
                @click="consoleExpanded = !consoleExpanded"
              >
                <v-icon>
                  {{ consoleExpanded ? "mdi-chevron-up" : "mdi-chevron-down" }}
                </v-icon>
              </v-btn>
            </v-fab-transition>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="4">
            <v-sheet rounded="lg">
              <v-list color="transparent">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Valheim</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      @click="checkIfInstalledValheim"
                      icon
                      :loading="loading.valheim"
                    >
                      <v-icon color="green" v-if="installed.valheim"
                        >mdi-check</v-icon
                      >
                      <v-icon color="red" v-else>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>BepInEx</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      @click="checkIfInstalledBepInEx"
                      icon
                      :loading="loading.bepInEx"
                    >
                      <v-icon color="green" v-if="installed.bepInEx"
                        >mdi-check</v-icon
                      >
                      <v-icon color="red" v-else>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Git</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn
                      @click="checkIfInstalledGit"
                      icon
                      :loading="loading.git"
                    >
                      <v-icon color="green" v-if="installed.git"
                        >mdi-check</v-icon
                      >
                      <v-icon color="red" v-else>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      Mods
                      <v-chip outlined small class="ma-2" color="green">
                        {{ version }}
                      </v-chip>
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn @click="updateMods" icon :loading="loading.mods">
                      <v-icon color="green" v-if="installed.mods === true">
                        mdi-check
                      </v-icon>
                      <v-icon
                        color="orange"
                        v-else-if="installed.mods === 'warning'"
                        >mdi-alert</v-icon
                      >
                      <v-icon color="red" v-else>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>

                <v-divider class="my-2"></v-divider>

                <v-list-item
                  link
                  color="grey lighten-4"
                  :disabled="loading.mods"
                  @click="refresh"
                >
                  <v-list-item-content>
                    <v-list-item-title> Refresh </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-sheet>
            <br />
            <v-btn
              dark
              block
              :color="installed.mods ? 'orange' : 'red'"
              :disabled="loading.mods"
              @click="updateMods"
              v-if="installed.mods === 'warning' || !installed.mods"
            >
              {{ installed.mods ? "Update Mods" : "Install Mods" }}
            </v-btn>
            <v-btn
              block
              color="primary"
              :disabled="!installed.mods || loading.mods"
              @click="startGame"
              v-else
            >
              Start Game
            </v-btn>
          </v-col>

          <v-col>
            <v-sheet rounded="lg">
              <nuxt v-if="!loading.config" />
            </v-sheet>
          </v-col>
        </v-row>

        <v-row justify="center">
          <v-dialog v-model="resetDialog" persistent width="500">
            <v-card dark>
              <v-card-title class="text-h5"> Reset mods? </v-card-title>
              <v-card-text>
                <p class="mb-0">This will reset all configs and plugins!</p>
                <p>The following folders will be reset:</p>
                <v-list>
                  <v-list-item>
                    <v-list-item-content>
                      - {{ configFolder }}
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      - {{ pluginsFolder }}
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions>
                <v-btn color="green darken-1" text @click="resetMods">
                  Reset
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="resetDialog = false">
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ipcRenderer, shell } from "electron";
import fs from "fs";
import Conf from "conf";
import Path from "path";
import { exec } from "child_process";

export default {
  data: () => ({
    console: [],
    consoleExpanded: false,
    links: ["Dashboard", "Messages", "Profile", "Updates"],
    installed: {
      valheim: undefined,
      bepInEx: undefined,
      git: undefined,
      mods: undefined,
    },
    loading: {
      config: true,
      valheim: true,
      bepInEx: true,
      git: true,
      mods: true,
    },
    config: undefined,
    version: "",
    resetDialog: false,
  }),
  async mounted() {
    await this.initiateConfig();

    this.version = `${this.config.get("modsVersion")}`.replace("version/", "");

    this.refresh();
  },
  watch: {
    consoleExpanded() {
      setTimeout(() => {
        this.updateConsolePosition();
      }, 275);
    },
    console() {
      this.updateConsolePosition();
    },
  },
  computed: {
    gitExePath() {
      const git = this.config.get("git");
      if (git) {
        return Path.resolve(`${git}\\git`);
      }
      return `git`;
    },
    valheimFolder() {
      return this?.config?.get("valheim") || "";
    },
    bepInExFolder() {
      return `${this.valheimFolder}\\BepInEx`;
    },
    configFolder() {
      return `${this.bepInExFolder}\\config`;
    },
    pluginsFolder() {
      return `${this.bepInExFolder}\\plugins`;
    },
    currentStateColor() {
      if (!this.installed) return "red";

      const array = Object.entries(this.installed);
      let problems = 0;

      array.forEach(([key, el]) => {
        if (!el) problems++;
      });

      if (problems === 0) return "green";
      if (problems < array.length) return "orange";
      return "red";
    },
  },
  methods: {
    async initiateConfig() {
      this.loading.config = true;

      const schema = {
        git: {
          type: "string",
          default: "",
        },
        valheim: {
          type: "string",
          default: "../Valheim",
        },
        mods: {
          type: "string",
          default: "https://github.com/DooDesch/Maisheim.git",
        },
        modsVersion: {
          type: "string",
          default: "version/0.205.5",
        },
      };

      this.config = new Conf({
        projectName: process.env.npm_package_name || "maisheim-mods-updater",
        schema,
      });

      if (!this.config.has("git")) {
        this.config.set("git", "");
      }

      if (!this.config.has("valheim")) {
        this.config.set("valheim", "../Valheim");
      }

      if (!this.config.has("mods")) {
        this.config.set("mods", "https://github.com/DooDesch/Maisheim.git");
      }

      if (!this.config.has("modsVersion")) {
        this.config.set("modsVersion", "version/0.205.5");
      }

      while (
        !this.checkIfInstalledValheim() ||
        !fs.lstatSync(this.config.get("valheim")).isDirectory()
      ) {
        await this.setValheimFolder();
      }

      this.loading.config = false;
    },
    checkIfInstalledValheim() {
      this.checkIfInstalled(
        "valheim",
        ["valheim.exe"],
        this.config.get("valheim")
      );

      return this.installed["valheim"];
    },
    async setValheimFolder() {
      const result = await ipcRenderer.invoke("dialog.showOpenDialog", {
        title: `Set Valheim Folder`,
        properties: ["openDirectory"],
      });

      if (!result) return;

      if (result.canceled) return;

      if (result.filePaths.length < 1) return;

      const path = result.filePaths[0];

      await this.config.set("valheim", path || "");

      return;
    },
    async refresh() {
      this.console = [];

      await this.initiateConfig();

      await this.checkIfInstalledBepInEx();
      await this.checkIfInstalledGit();
      await this.checkIfUpdatedMods();
    },
    async checkIfInstalledBepInEx() {
      await this.checkIfInstalled(
        "bepInEx",
        ["winhttp.dll", "doorstop_config.ini"],
        this.valheimFolder
      );
    },
    async checkIfInstalledGit() {
      const git = this.config.get("git");
      if (git) {
        await this.checkIfInstalled("git", ["git.exe"], git);
      }

      await this.run(`${this.gitExePath} --version`, async (cb) => {
        if (cb.error || cb.stderr) {
          this.warn(`Git error: ${cb.error || cb.stdout || cb.stderr}`);
          this.installed.git = false;
          await this.askForGitInstallation();
        } else {
          this.log("Git is ready");
          this.installed.git = true;
        }
      });

      this.loading.git = false;
    },
    async askForGitInstallation() {
      const result = await ipcRenderer.invoke("dialog.showMessageBox", {
        title: `Git not found`,
        message: `Git not found!`,
        type: "warning",
        buttons: ["Yes", "No"],
        defaultId: 0,
        cancelId: 1,
        detail: `Git is required to use this application.\r\nDo you want to download and install git now?`,
      });

      if (!result) return;

      if (result.response === 1) return;

      await shell.openExternal("https://git-scm.com/download/win");

      await ipcRenderer.invoke("dialog.showMessageBox", {
        title: `Install git manually`,
        message: `Install git manually`,
        type: "info",
        defaultId: 0,
        cancelId: 1,
        detail: `Download and install git.\r\nPress "ok" when you're finished.`,
      });

      await this.checkIfInstalledGit();
    },
    async checkIfInstalled(item, filesRequired, filesPath) {
      this.loading[item] = true;
      this.installed[item] = true;

      try {
        const files = await fs.readdirSync(filesPath);

        await filesRequired.forEach((file) => {
          if (!files.includes(file)) {
            this.installed[item] = false;
            return;
          }
        });
      } catch (error) {
        this.error(error);
        this.installed[item] = false;
      }

      console.log(`${item} installed : ${this.installed[item]}`);

      this.loading[item] = false;
    },
    async checkIfUpdatedMods() {
      this.loading.mods = true;
      this.installed.mods = true;

      if (!this.hasRequirements()) {
        this.loading.mods = false;
        this.installed.mods = false;
        return;
      }

      const dir = Path.resolve(this.bepInExFolder);
      const git = `cd ${dir} && ${this.gitExePath}`;

      this.log("Checking for mod updates");
      await this.run(`${git} fetch --dry-run`, (cb) => {
        if (cb.error || cb.stderr) {
          this.warn(`Mods outdated: ${cb.error || cb.stdout || cb.stderr}`);
          this.installed.mods = cb.error ? false : "warning";
        } else {
          this.log("Mods are up to date");
        }
        this.loading.mods = false;
      });
    },
    resetMods() {
      this.resetDialog = false;
      this.loading.mods = true;
      this.installed.mods = true;

      if (!this.hasRequirements()) {
        this.loading.mods = false;
        this.installed.mods = false;
        return;
      }

      const dir = Path.resolve(this.bepInExFolder);
      const git = `cd ${dir} && ${this.gitExePath}`;
      const version = this.config.get("modsVersion");

      this.log(`Reset branch ${version}`);
      this.run(`${git} reset --hard origin/${version}`, (result) => {
        if (result.error) {
          this.error(`Something went wrong : ${result.error.message}`);
          this.installed.mods = false;
        }

        if (result.stdout) this.log(result.stdout);
        this.loading.mods = false;
      });
    },
    updateMods() {
      this.loading.mods = true;
      this.installed.mods = true;

      if (!this.hasRequirements()) {
        this.loading.mods = false;
        this.installed.mods = false;
        return;
      }

      const dir = Path.resolve(this.bepInExFolder);
      const git = `cd ${dir} && ${this.gitExePath}`;

      this.run(`${git} fetch --dry-run`, (cb) => {
        const repo = this.config.get("mods");
        const version = this.config.get("modsVersion");

        if (cb.error?.code === 128) {
          this.log(`Remove config dir at ${dir}`);
          fs.rmSync(`${dir}/config`, { recursive: true, force: true });
          this.log(`Initialize git repo ${repo}`);
          this.run(`${git} init .`, () => {
            this.log("Set git config");
            this.run(`${git} config pull.rebase false`, () => {
              this.log(`Add remote origin ${repo}`);
              this.run(`${git} remote add origin ${repo}`, () => {
                this.log("Fetch git");
                this.run(`${git} fetch`, () => {
                  this.log(`Checkout branch ${version}`);
                  this.run(`${git} checkout -b ${version}`, () => {
                    this.log(`Pull branch ${version}`);
                    this.run(`${git} pull origin ${version}`, (result) => {
                      if (result.error) {
                        this.error(
                          `Something went wrong : ${result.error.message}`
                        );
                        this.installed.mods = false;
                      }

                      if (result.stdout) this.log(result.stdout);
                      this.loading.mods = false;
                    });
                  });
                });
              });
            });
          });
        } else if (!cb.error) {
          this.log(`Update to ${version}`);
          this.run(`${git} checkout ${version}`, () => {
            this.log(`Pull branch ${version}`);
            this.run(`${git} pull origin ${version}`, (result) => {
              if (result.error) {
                this.error(`Something went wrong : ${result.error.message}`);
                this.installed.mods = false;
              }

              if (result.stdout) this.log(result.stdout);
              this.loading.mods = false;
            });
          });
        }
      });
    },
    hasRequirements() {
      if (!this.installed.bepInEx) {
        this.error("Install BepInEx first");
        return false;
      }

      if (!this.installed.git) {
        this.error("Install Git first");
        return false;
      }

      if (!this.installed.mods === true) {
        this.error("Update Mods first");
        return false;
      }

      return true;
    },
    startGame() {
      const dir = Path.resolve(this.valheimFolder);
      this.run(`cd ${dir} && .\\valheim.exe`);
    },
    async run(cmd, callback) {
      return new Promise(function (resolve, reject) {
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.warn(`error: ${error.message}`);
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
          }
          console.log(`stdout: ${stdout}`);

          if (callback) {
            callback({ error, stdout, stderr });
          }

          resolve(stdout.trim());
        });
      });
    },
    log(msg) {
      this.addToConsole(msg, "info");
      console.log(msg);
    },
    warn(msg) {
      this.addToConsole(msg, "warning");
      console.warn(msg);
    },
    error(msg) {
      this.addToConsole(msg, "error");
      console.error(msg);
    },
    addToConsole(msg, type) {
      this.console.push({ type, msg });
    },
    updateConsolePosition() {
      this.$nextTick(() => {
        const el = this.$refs["consoleLogs"].$el;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.scroll {
  transition: all 0.25s ease-in-out;
  position: relative;
  min-height: 100px;
  height: 23vh;
  max-height: 23vh;
  overflow-y: auto;

  &.expanded {
    height: 80vh;
    max-height: 80vh;
  }

  .v-alert__content {
    white-space: pre;
  }
}
</style>
