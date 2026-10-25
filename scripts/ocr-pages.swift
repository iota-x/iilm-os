import Foundation
import Vision
import AppKit

// usage: ocr <out.json> <image>...  → {"<basename>": "<text>"}
let args = Array(CommandLine.arguments.dropFirst())
let out = args[0]
var result: [String: String] = [:]
if let d = try? Data(contentsOf: URL(fileURLWithPath: out)), let j = try? JSONSerialization.jsonObject(with: d) as? [String: String] { result = j }
for (i, path) in args.dropFirst().enumerated() {
  let name = (path as NSString).lastPathComponent
  if result[name] != nil { continue }
  guard let img = NSImage(contentsOfFile: path), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { continue }
  let req = VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.usesLanguageCorrection = true
  try? VNImageRequestHandler(cgImage: cg).perform([req])
  let text = (req.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: "\n")
  result[name] = text
  if i % 25 == 0 {
    FileHandle.standardError.write("\(i) \(name)\n".data(using: .utf8)!)
    let d = try! JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
    try! d.write(to: URL(fileURLWithPath: out))
  }
}
let d = try! JSONSerialization.data(withJSONObject: result, options: [.sortedKeys])
try! d.write(to: URL(fileURLWithPath: out))
print("done \(result.count)")
