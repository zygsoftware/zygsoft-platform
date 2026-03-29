#!/usr/bin/env swift

import AppKit
import Foundation
import Vision

struct OCRResult: Codable {
    let text: String?
    let error: String?
}

func printJSON(_ result: OCRResult, exitCode: Int32) -> Never {
    let encoder = JSONEncoder()
    if let data = try? encoder.encode(result),
       let json = String(data: data, encoding: .utf8) {
        print(json)
    } else {
        print("{\"error\":\"JSON encode failed.\"}")
    }
    Foundation.exit(exitCode)
}

let args = CommandLine.arguments
guard args.count >= 2 else {
    printJSON(OCRResult(text: nil, error: "Usage: vision_ocr.swift <image_path> [tr|en]"), exitCode: 1)
}

let imagePath = args[1]
let lang = args.count >= 3 ? args[2].lowercased() : "tr"
let locale = lang == "en" ? "en-US" : "tr-TR"

guard let image = NSImage(contentsOfFile: imagePath) else {
    printJSON(OCRResult(text: nil, error: "Image could not be loaded."), exitCode: 1)
}

var rect = NSRect(origin: .zero, size: image.size)
guard let cgImage = image.cgImage(forProposedRect: &rect, context: nil, hints: nil) else {
    printJSON(OCRResult(text: nil, error: "CGImage could not be created."), exitCode: 1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
request.recognitionLanguages = [locale]

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

do {
    try handler.perform([request])
    let observations = (request.results as? [VNRecognizedTextObservation]) ?? []
    let text = observations
        .compactMap { $0.topCandidates(1).first?.string }
        .joined(separator: "\n")
    printJSON(OCRResult(text: text, error: nil), exitCode: 0)
} catch {
    printJSON(OCRResult(text: nil, error: error.localizedDescription), exitCode: 1)
}
