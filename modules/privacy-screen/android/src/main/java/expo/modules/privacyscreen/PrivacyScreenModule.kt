package expo.modules.privacyscreen

import android.view.WindowManager
import io.github.expo.modules.v2.ExpoModule
import io.github.expo.modules.v2.JS
import io.github.expo.modules.v2.Module
import io.github.expo.modules.v2.react.currentActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@ExpoModule("PrivacyScreen")
class PrivacyScreenModule : Module() {
  @JS
  suspend fun setEnabled(enabled: Boolean): Unit = withContext(Dispatchers.Main) {
    val window = currentActivity?.window ?: return@withContext
    if (enabled) {
      window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
    } else {
      window.clearFlags(WindowManager.LayoutParams.FLAG_SECURE)
    }
  }
}
