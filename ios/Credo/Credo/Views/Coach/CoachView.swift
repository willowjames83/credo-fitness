import SwiftUI

struct CoachView: View {
    @State private var vm = CoachViewModel()

    var body: some View {
        VStack(spacing: 0) {
            if vm.messages.isEmpty {
                emptyState
            } else {
                messageList
            }

            if let error = vm.errorMessage {
                errorBanner(error)
            }

            inputBar
        }
        .navigationTitle("AI Coach")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            if !vm.messages.isEmpty {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        vm.clearConversation()
                    } label: {
                        Image(systemName: "trash")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(CredoColors.textTertiary)
                    }
                }
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        ScrollView {
            VStack(spacing: 20) {
                Spacer().frame(height: 40)

                Image(systemName: "sparkles")
                    .font(.system(size: 40, weight: .light))
                    .foregroundStyle(CredoColors.accent)

                VStack(spacing: 6) {
                    Text("AI Coach")
                        .font(.credoDisplay(size: 22))
                        .foregroundStyle(CredoColors.textPrimary)

                    Text("Ask anything about your training,\nprogress, or programming")
                        .font(.credoBody(size: 14, weight: .regular))
                        .foregroundStyle(CredoColors.textSecondary)
                        .multilineTextAlignment(.center)
                }

                // Suggested prompts
                VStack(spacing: 8) {
                    FlowLayout(spacing: 8) {
                        ForEach(vm.suggestedPrompts, id: \.self) { prompt in
                            SuggestedPromptChip(text: prompt) { selected in
                                Task {
                                    await vm.sendSuggestedPrompt(selected)
                                }
                            }
                        }
                    }
                }
                .padding(.top, 8)

                Spacer()
            }
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Message List

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(vm.messages) { message in
                        MessageBubble(message: message)
                            .id(message.id)
                    }

                    if vm.isLoading {
                        typingIndicator
                            .id("typing")
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            .onChange(of: vm.messages.count) {
                withAnimation(.easeOut(duration: 0.2)) {
                    if let last = vm.messages.last {
                        proxy.scrollTo(last.id, anchor: .bottom)
                    }
                }
            }
            .onChange(of: vm.isLoading) {
                if vm.isLoading {
                    withAnimation(.easeOut(duration: 0.2)) {
                        proxy.scrollTo("typing", anchor: .bottom)
                    }
                }
            }
        }
    }

    // MARK: - Typing Indicator

    private var typingIndicator: some View {
        HStack {
            HStack(spacing: 4) {
                ForEach(0..<3, id: \.self) { index in
                    Circle()
                        .fill(CredoColors.textTertiary)
                        .frame(width: 6, height: 6)
                        .offset(y: typingDotOffset(index: index))
                        .animation(
                            .easeInOut(duration: 0.5)
                            .repeatForever()
                            .delay(Double(index) * 0.15),
                            value: vm.isLoading
                        )
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(CredoColors.surface)
            .clipShape(
                UnevenRoundedRectangle(
                    topLeadingRadius: 4,
                    bottomLeadingRadius: 16,
                    bottomTrailingRadius: 16,
                    topTrailingRadius: 16
                )
            )
            .overlay(
                UnevenRoundedRectangle(
                    topLeadingRadius: 4,
                    bottomLeadingRadius: 16,
                    bottomTrailingRadius: 16,
                    topTrailingRadius: 16
                )
                .stroke(CredoColors.border, lineWidth: 1)
            )

            Spacer()
        }
    }

    private func typingDotOffset(index: Int) -> CGFloat {
        vm.isLoading ? -4 : 0
    }

    // MARK: - Error Banner

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 13))
                .foregroundStyle(CredoColors.danger)

            Text(message)
                .font(.credoBody(size: 12, weight: .medium))
                .foregroundStyle(CredoColors.danger)
                .lineLimit(2)

            Spacer()

            Button {
                Task {
                    await vm.retry()
                }
            } label: {
                Text("Retry")
                    .font(.credoBody(size: 12, weight: .semibold))
                    .foregroundStyle(CredoColors.accent)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(CredoColors.warningLight)
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        VStack(spacing: 0) {
            Divider()
                .foregroundStyle(CredoColors.border)

            HStack(spacing: 10) {
                TextField("Ask your coach...", text: $vm.inputText, axis: .vertical)
                    .font(.credoBody(size: 14, weight: .regular))
                    .lineLimit(1...4)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(CredoColors.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 20))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(CredoColors.border, lineWidth: 1)
                    )

                Button {
                    Task {
                        await vm.sendMessage()
                    }
                } label: {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 32, weight: .medium))
                        .foregroundStyle(
                            canSend ? CredoColors.accent : CredoColors.textTertiary
                        )
                }
                .disabled(!canSend)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(CredoColors.bg)
        }
    }

    private var canSend: Bool {
        !vm.inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !vm.isLoading
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: ProposedViewSize(result.sizes[index])
            )
        }
    }

    private func computeLayout(proposal: ProposedViewSize, subviews: Subviews) -> LayoutResult {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var sizes: [CGSize] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            sizes.append(size)

            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }

            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        let totalHeight = y + rowHeight
        return LayoutResult(
            size: CGSize(width: maxWidth, height: totalHeight),
            positions: positions,
            sizes: sizes
        )
    }

    private struct LayoutResult {
        let size: CGSize
        let positions: [CGPoint]
        let sizes: [CGSize]
    }
}
