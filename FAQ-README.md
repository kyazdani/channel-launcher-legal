# Frequently Asked Questions

Run `python3 -m http.server 8765 --bind 127.0.0.1` from this repository, then open `http://127.0.0.1:8765/faq.html`. The review copy uses the bundled draft in `assets/faq.json`.

After approval, publish the exact same document as the **default JSON value** of the Firebase client Remote Config parameter `channel_launcher_faq`. Do not use conditional values if the site and apps should match. Use a read-only Remote Config identity with Google Cloud application default credentials, then run:

```sh
node scripts/update-faq.mjs channel-launcher
```

The exporter uses the [Remote Config read endpoint](https://firebase.google.com/docs/reference/remote-config/rest/v1/projects/getRemoteConfig). It validates the value and writes only the public FAQ, never the full template or any credentials. Run it before deploying the static site, or add it to the site's build using a read-only CI identity. The static site does not contact Firebase from visitors' browsers. Until a new export is deployed, visitors see the previous snapshot.
