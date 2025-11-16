import Cocoa
import Foundation

// Exit codes:
// 0 = success (all modifier keys released)
// 1 = timeout reached
// 2 = unexpected error

do {
    // Get timeout and polling interval from command line arguments (in milliseconds)
    let timeoutMs = CommandLine.arguments.count > 1 ? Int(CommandLine.arguments[1]) ?? 2000 : 2000
    let pollingIntervalMs = CommandLine.arguments.count > 2 ? Int(CommandLine.arguments[2]) ?? 50 : 50

    let startTime = Date()
    let timeoutSeconds = Double(timeoutMs) / 1000.0
    let pollingIntervalSeconds = Double(pollingIntervalMs) / 1000.0

    // Modifier key mask values
    let commandMask: UInt = 1048576  // 0x100000
    let optionMask: UInt = 524288    // 0x80000
    let controlMask: UInt = 262144   // 0x40000
    let shiftMask: UInt = 131072     // 0x20000

    func areModifierKeysPressed() -> Bool {
        let flags = NSEvent.modifierFlags.rawValue
        
        let commandDown = (flags & commandMask) != 0
        let optionDown = (flags & optionMask) != 0
        let controlDown = (flags & controlMask) != 0
        let shiftDown = (flags & shiftMask) != 0
        
        return commandDown || optionDown || controlDown || shiftDown
    }

    // Poll until keys are released or timeout
    while Date().timeIntervalSince(startTime) < timeoutSeconds {
        if !areModifierKeysPressed() {
            // All keys released - exit successfully
            exit(0)
        }
        
        // Sleep for polling interval
        Thread.sleep(forTimeInterval: pollingIntervalSeconds)
    }

    // Timeout reached - exit with error code 1
    exit(1)
} catch {
    // Unexpected error occurred - exit with error code 2
    exit(2)
}
