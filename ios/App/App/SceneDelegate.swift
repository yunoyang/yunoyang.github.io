import UIKit
import Capacitor

// iOS/iPadOS 27부터 UIScene 생명주기 채택 필수 (미채택 시 실행 즉시 종료)
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // 창과 루트 뷰컨트롤러(CAPBridgeViewController)는 Info.plist의 UISceneStoryboardFile(Main)로 생성됨
        if let ctx = connectionOptions.urlContexts.first { openURL(ctx.url) }
        if let activity = connectionOptions.userActivities.first { continueActivity(activity) }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        for ctx in URLContexts { openURL(ctx.url) }
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        continueActivity(userActivity)
    }

    private func openURL(_ url: URL) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: url, options: [:])
    }

    private func continueActivity(_ activity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: activity, restorationHandler: { _ in })
    }
}
