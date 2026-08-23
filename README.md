# Welcome to ReactEdge

## 1. Clone the repository

```bash
git clone https://github.com/reactedge/magento-starter ReactEdge
cd ReactEdge
```

---

## 2. Install Mise

ReactEdge uses Mise for tool version management and project tasks.

### macOS

```bash
brew install mise
```

### Linux / other platforms

Activate Mise for your shell by following the setup instructions shown after installation, or the official Mise documentation.

```bash
curl https://mise.run | sh
```

Verify:

```bash
mise --version
```

When you first enter the ReactEdge repository, Mise may ask you to trust
the project's mise.toml:
```bash
mise trust
```

You can inspect mise.toml before trusting it.

---

## 3. Install ReactEdge dependencies

Install all project dependencies:

```bash
npm ci
```

---

## 4. Configure ReactEdge

Generate the local configuration:

```bash
mise run configure
```

The configuration wizard will create:

- `.env`
- `services/orchestrator/.env.dev`
- `widgets/*/public/reactedge-runtime.json`

---

# 5. Magento integration

Change to your Magento or Mage-OS installation directory:

```bash
cd /path/to/magento
```

Update `composer.json`:

```json
"minimum-stability": "dev"
```

Install the ReactEdge bridge:

```bash
composer require reactedge/widgetbridgelight
```

Enable the module:

```bash
bin/magento module:enable ReactEdge_WidgetBridge
bin/magento setup:upgrade
```

---

### Install Magento layout integration

ReactEdge provides starter Magento layout files in:

```text
widgets/integration/magento/
```

These files define where the ReactEdge widgets are mounted within the Magento storefront.

#### Product Gallery

Copy:

```text
widgets/integration/magento/catalog_product_view.xml
```

to your active Magento theme:

```text
app/design/frontend/<Vendor>/<theme>/Magento_Catalog/layout/catalog_product_view.xml
```

#### Megamenu

Copy:

```text
widgets/integration/magento/default.xml
widgets/integration/magento/megamenu.xml
```

to:

```text
app/design/frontend/<Vendor>/<theme>/Magento_Theme/layout/
```

If your theme already contains one of these layout files, **do not overwrite it**. Merge the ReactEdge layout instructions into the existing file instead.

The supplied files are starter integrations and can be adjusted to change widget placement within your theme.

## 6. Launch a widget locally

For example:

```bash
mise run widget-dev -- productgallery
```

or:

```bash
mise run widget-dev -- megamenu
```

---

## 7. Deploy widgets

Build and publish the widgets:

```bash
mise run widgets-deploy
```

---

## 8. Verify the installation

Check that the module is installed:

```bash
bin/magento module:status ReactEdge_WidgetBridge
```

Inspect widget configuration:

```bash
bin/magento config:show reactedge/productgallery/enabled
bin/magento config:show reactedge/megamenu/enabled
bin/magento config:show reactedge/usp/enabled
```

---

## Configure integrations

Enable server-side rendering:

```bash
bin/magento config:set reactedge/widgets_ssr/enabled 1
```

---

### Enable widgets

Enable the widgets you want to use:

```bash
bin/magento config:set reactedge/megamenu/enabled 1

bin/magento config:set reactedge/productgallery/enabled 1

bin/magento config:set reactedge/usp/enabled 1
```

Flush the cache:

```bash
bin/magento cache:flush
```
---

## 9. Revert to Magento UI

Disable the widgets you don't want to use:

```bash
bin/magento config:set reactedge/megamenu/enabled 0

bin/magento config:set reactedge/productgallery/enabled 0

bin/magento config:set reactedge/usp/enabled 0
```

Flush the cache:

```bash
bin/magento cache:flush
```
---

## 10. Modify and redeploy a widget

Widget deployments use the contracts referenced by the workspace registry (see `workspace/registry.json`)

Open the workspace registry and identify the contract configured for the widget you want to modify.

Either update that contract or create a new contract and update the registry to reference it.

For example, change the Product Gallery presentation mode from "tile" to "gallery" in its contract.

Redeploy the widgets:

```bash
mise run widgets-deploy
```

Then clear the ReactEdge Magento cache:
```bash
bin/magento cache:clean reactedge
```

## 11. Project tasks

Mise is used as a task runner. The commands it executes are defined in
`mise.toml`, with supporting scripts in `launcher/scripts/`, and can be
inspected before running them.

| Command | Purpose |
| --- | --- |
| `mise run configure` | Generates the local ReactEdge configuration |
| `mise run widget-dev -- <widget>` | Starts a widget locally with Vite |
| `mise run widget-build -- <widget>` | Builds a selected widget |
| `mise run widgets-deploy` | Builds and deploys selected widget assets |
| `mise run widget-test -- <widget>` | Runs tests for a selected widget |