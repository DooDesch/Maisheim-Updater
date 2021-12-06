<template>
  <div>
    <v-sheet>
      <v-card>
        <v-card-title primary-title> Settings </v-card-title>
        <v-card-text>
          <v-row v-for="(setting, index) in settings" :key="index">
            <v-col cols="1">
              <v-btn
                x-small
                text
                icon
                color="primary"
                class="mr-6"
                @click="editSetting(index, setting)"
                :disabled="setting.disabled || false"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="5"> {{ setting.title }} </v-col>
            <v-col>
              <v-tooltip top v-if="setting.resolve">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">{{ setting.value }}</span>
                </template>
                <span>{{ resolvePath(setting.value) }}</span>
              </v-tooltip>
              <span v-else>{{ setting.value }}</span>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-sheet>
    <!-- <div class="e-nuxt-container">
      <div class="e-nuxt-content">
        <v-btn color="success" @click="pullGit">Git</v-btn>
        <div class="e-nuxt-system-info">
        <system-information />
      </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
import Conf from "conf";
import Path from "path";
import SystemInformation from "@/components/SystemInformation.vue";

export default {
  components: {
    SystemInformation,
  },
  data() {
    return {
      externalContent: "",
      config: undefined,
      folder: "",
      settings: {
        git: {
          title: "Git Folder",
          type: "folder",
        },
        valheim: {
          title: "Valheim Folder",
          type: "folder",
        },
        mods: {
          title: "Github Modpack",
          disabled: true,
        },
        modsVersion: {
          title: "Modpack Branch/Version",
          disabled: true,
        },
      },
    };
  },
  created() {
    this.config = new Conf({
      projectName: process.env.npm_package_name || "maisheim-mods-updater",
    });

    this.setSetting("git", true);
    this.setSetting("valheim", true);
    this.setSetting("mods");
    this.setSetting("modsVersion");
  },
  methods: {
    setSetting(setting, resolve = false) {
      this.settings[setting].value = this.config.get(setting);
      this.settings[setting].resolve = resolve;
    },
    async editSetting(setting, values) {
      let result;

      if (values.type === "folder") {
        result = await ipcRenderer.invoke("dialog.showOpenDialog", {
          title: `Edit ${values.title}`,
          properties: ["openDirectory"],
        });
      } else if (values.type === "file") {
        result = await ipcRenderer.invoke("dialog.showOpenDialog", {
          title: `Edit ${values.title}`,
          properties: ["openFile"],
          filters: [{ name: "Exe", extensions: ["exe"] }],
        });
      }

      if (!result) return;

      if (result.canceled) return;

      if (result.filePaths.length < 1) return;

      const path = result.filePaths[0];

      this.config.set(setting, path);
      this.setSetting(setting, true);
    },
    resolvePath(path) {
      return Path.resolve(path);
    },
  },
};
</script>
