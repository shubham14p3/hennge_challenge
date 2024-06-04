import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import RecipientsBadge from './RecipientsBadge';

interface RecipientsDisplayProps {
    recipients: string[];
}

const Container = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    width: 100%;
`;

const Recipients = styled.div`
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const BadgeContainer = styled.div`
    flex-shrink: 0; 
`;

const RecipientTooltip = styled.div`
    position: fixed;
    top: 8px;
    right: 8px;
    max-width: calc(100% - 16px);
    max-height: 50vh;
    padding: 8px 16px;
    background-color: #666;
    color: #f0f0f0;
    border-radius: 24px;
    display: none;
    align-items: center;
    box-sizing: border-box;
    z-index: 1000;
    overflow-y: auto;  // Enable vertical scrolling
    white-space: normal;  // Allow text wrapping

    &.visible {
        display: flex;
        flex-direction: column;
    }
`;

const RecipientsDisplay: React.FC<RecipientsDisplayProps> = ({ recipients }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleRecipients, setVisibleRecipients] = useState<string[]>([]);
    const [tooltipVisible, setTooltipVisible] = useState(false);

    useEffect(() => {
        const updateDisplay = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const ctx = document.createElement('canvas').getContext('2d');
            if (!ctx) return;

            ctx.font = '16px Arial';
            let totalWidth = 0;
            let tempVisibleRecipients = [];

            for (const email of recipients) {
                const textWidth = ctx.measureText(email + ', ').width;
                if (totalWidth + textWidth < containerWidth - 50) { 
                    tempVisibleRecipients.push(email);
                    totalWidth += textWidth;
                } else {
                    break;
                }
            }

            setVisibleRecipients(tempVisibleRecipients);
        };

        updateDisplay();
        window.addEventListener('resize', updateDisplay);
        return () => window.removeEventListener('resize', updateDisplay);
    }, [recipients]);

    const handleMouseEnter = () => setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    const isTruncated = visibleRecipients.length < recipients.length;
    const displayText = isTruncated ? `${visibleRecipients.join(', ')}, ...` : recipients.join(', ');

    return (
        <Container ref={containerRef}>
            <Recipients>{displayText}</Recipients>
            {isTruncated && (
                <BadgeContainer onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <RecipientsBadge numTruncated={recipients.length - visibleRecipients.length} />
                    <RecipientTooltip className={tooltipVisible ? 'visible' : ''}>{recipients.join(', ')}</RecipientTooltip>
                </BadgeContainer>
            )}
        </Container>
    );
};

export default RecipientsDisplay;
