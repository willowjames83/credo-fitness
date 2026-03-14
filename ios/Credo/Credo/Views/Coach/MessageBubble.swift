import SwiftUI

struct MessageBubble: View {
    let message: CoachMessage

    private var isUser: Bool {
        message.role == .user
    }

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 48) }

            VStack(alignment: isUser ? .trailing : .leading, spacing: 4) {
                formattedContent
                    .font(.credoBody(size: 14, weight: .regular))
                    .foregroundStyle(isUser ? .white : CredoColors.textPrimary)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(isUser ? CredoColors.accent : CredoColors.surface)
                    .clipShape(bubbleShape)
                    .overlay(
                        bubbleShape
                            .stroke(isUser ? Color.clear : CredoColors.border, lineWidth: 1)
                    )

                Text(formattedTimestamp)
                    .font(.credoBody(size: 10, weight: .regular))
                    .foregroundStyle(CredoColors.textTertiary)
            }

            if !isUser { Spacer(minLength: 48) }
        }
    }

    // MARK: - Bubble Shape

    private var bubbleShape: some Shape {
        if isUser {
            UnevenRoundedRectangle(
                topLeadingRadius: 16,
                bottomLeadingRadius: 16,
                bottomTrailingRadius: 4,
                topTrailingRadius: 16
            )
        } else {
            UnevenRoundedRectangle(
                topLeadingRadius: 4,
                bottomLeadingRadius: 16,
                bottomTrailingRadius: 16,
                topTrailingRadius: 16
            )
        }
    }

    // MARK: - Formatted Content

    @ViewBuilder
    private var formattedContent: some View {
        let lines = message.content.components(separatedBy: "\n")
        VStack(alignment: .leading, spacing: 4) {
            ForEach(Array(lines.enumerated()), id: \.offset) { _, line in
                if line.hasPrefix("- ") || line.hasPrefix("\u{2022} ") {
                    HStack(alignment: .top, spacing: 6) {
                        Text("\u{2022}")
                            .font(.credoBody(size: 14, weight: .bold))
                        formattedTextView(String(line.dropFirst(2)))
                    }
                } else if !line.isEmpty {
                    formattedTextView(line)
                }
            }
        }
    }

    private func formattedTextView(_ text: String) -> Text {
        var result = Text("")
        var remaining = text

        while let boldStart = remaining.range(of: "**") {
            let before = String(remaining[remaining.startIndex..<boldStart.lowerBound])
            if !before.isEmpty {
                result = result + Text(before)
            }
            remaining = String(remaining[boldStart.upperBound...])

            if let boldEnd = remaining.range(of: "**") {
                let boldText = String(remaining[remaining.startIndex..<boldEnd.lowerBound])
                result = result + Text(boldText).bold()
                remaining = String(remaining[boldEnd.upperBound...])
            } else {
                result = result + Text("**" + remaining)
                remaining = ""
            }
        }

        if !remaining.isEmpty {
            result = result + Text(remaining)
        }

        return result
    }

    // MARK: - Timestamp

    private var formattedTimestamp: String {
        let formatter = DateFormatter()
        let calendar = Calendar.current
        if calendar.isDateInToday(message.timestamp) {
            formatter.dateFormat = "h:mm a"
        } else {
            formatter.dateFormat = "MMM d, h:mm a"
        }
        return formatter.string(from: message.timestamp)
    }
}
