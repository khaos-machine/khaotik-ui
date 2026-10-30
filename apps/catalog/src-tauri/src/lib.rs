#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  #[allow(unused_mut)]
  let mut builder = tauri::Builder::default();

  // Dev-only MCP bridge: a WebSocket on 127.0.0.1 that lets an MCP client
  // screenshot the window and read the DOM — the only way to catch a
  // stylesheet that parsed but cascaded wrong. Both gates are deliberate: the
  // feature is off by default, and debug_assertions means even enabling it
  // cannot produce a release build that listens. Bind address is explicit
  // because the plugin defaults to 0.0.0.0, and this socket executes arbitrary
  // JavaScript in the webview. (Reference: gitty dev/mcp-bridge.)
  #[cfg(all(debug_assertions, feature = "mcp-bridge"))]
  {
    builder = builder.plugin(
      tauri_plugin_mcp_bridge::Builder::new()
        .bind_address("127.0.0.1")
        .build(),
    );
  }

  builder
    .setup(|app| {
      // The bridge's permission is granted HERE, at runtime and to the main
      // window only, under the same gates as the plugin itself — not in
      // capabilities/default.json, which a release build compiles. So no
      // release artifact names an `mcp-bridge:*` permission at all.
      #[cfg(all(debug_assertions, feature = "mcp-bridge"))]
      {
        use tauri::Manager;
        app.add_capability(
          tauri::ipc::CapabilityBuilder::new("mcp-bridge-dev")
            .window("main")
            .permission("mcp-bridge:default"),
        )?;
      }
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .plugin(tauri_plugin_updater::Builder::new().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
