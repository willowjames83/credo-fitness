import Foundation

struct Benchmark: Identifiable {
    let id = UUID()
    let name: String
    let value: Double
    let unit: String
    let percentile: Int
    let delta: String
    let pillar: Pillar
    let lastTested: String
    var isInversed: Bool = false
}

struct CompositePercentile {
    let value: Int
    let context: String
}
