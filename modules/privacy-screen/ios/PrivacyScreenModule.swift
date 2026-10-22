import ExpoModulesCore
import UIKit

@ExpoModule("PrivacyScreen")
public class PrivacyScreenModule: Module {
  @JS
  @MainActor
  func setEnabled(enabled: Bool) async {
    if enabled {
      PrivacyShield.shared.enable()
    } else {
      PrivacyShield.shared.disable()
    }
  }
}

/// The app-switcher snapshot is taken after `willResignActive`, so the cover hides it.
@MainActor
final class PrivacyShield {
  static let shared = PrivacyShield()

  private var observers: [NSObjectProtocol] = []
  private var cover: UIView?

  func enable() {
    guard observers.isEmpty else { return }
    let center = NotificationCenter.default
    observers = [
      center.addObserver(forName: UIApplication.willResignActiveNotification, object: nil, queue: .main) { _ in
        MainActor.assumeIsolated { PrivacyShield.shared.show() }
      },
      center.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { _ in
        MainActor.assumeIsolated { PrivacyShield.shared.hide() }
      },
    ]
  }

  func disable() {
    observers.forEach(NotificationCenter.default.removeObserver)
    observers.removeAll()
    hide()
  }

  private func show() {
    guard cover == nil, let window = keyWindow else { return }
    let blur = UIVisualEffectView(effect: UIBlurEffect(style: .systemThickMaterial))
    blur.frame = window.bounds
    blur.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    window.addSubview(blur)
    cover = blur
  }

  private func hide() {
    cover?.removeFromSuperview()
    cover = nil
  }

  private var keyWindow: UIWindow? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first(where: \.isKeyWindow)
  }
}
